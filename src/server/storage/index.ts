import "server-only";
import { createReadStream } from "node:fs";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { Readable } from "node:stream";

type Access = "public" | "private";
type ByteRange = { start: number; end: number };
export interface StorageAdapter {
  put(access: Access, key: string, contents: Uint8Array): Promise<void>;
  get(access: Access, key: string, range?: ByteRange): Promise<{ body: ReadableStream<Uint8Array>; size: number }>;
  size(access: Access, key: string): Promise<number>;
  delete(access: Access, key: string): Promise<void>;
  url(access: "public", key: string): string;
}

const keyPattern = /^[a-f0-9-]{36}(?:-\d{1,4})?\.[a-z0-9]{2,8}$/;
export const validStorageKey = (key: string) => keyPattern.test(key);
const roots = {
  public: resolve(process.env.STORAGE_LOCAL_PUBLIC_DIR || "storage/public"),
  private: resolve(process.env.STORAGE_LOCAL_PRIVATE_DIR || "storage/private"),
};
function contains(root: string, path: string) {
  const child = relative(root, path);
  return child === "" || (!child.startsWith("..") && !isAbsolute(child));
}
if (contains(roots.public, roots.private) || contains(roots.private, roots.public)) {
  throw new Error("Public and private storage must use separate directories");
}

function localPath(access: Access, key: string) {
  if (!validStorageKey(key)) throw new Error("Invalid storage key");
  return resolve(roots[access], key);
}

const local: StorageAdapter = {
  async put(access, key, contents) {
    const path = localPath(access, key);
    const temporary = `${path}.${randomUUID()}.tmp`;
    await mkdir(dirname(path), { recursive: true });
    try {
      await writeFile(temporary, contents, { flag: "wx", mode: 0o600 });
      await rename(temporary, path);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
  },
  async get(access, key, range) {
    const path = localPath(access, key);
    const size = (await stat(path)).size;
    const stream = createReadStream(path, range);
    return { size, body: Readable.toWeb(stream) as ReadableStream<Uint8Array> };
  },
  async size(access, key) {
    return (await stat(localPath(access, key))).size;
  },
  async delete(access, key) {
    await rm(localPath(access, key), { force: true });
  },
  url(_access, key) {
    if (!validStorageKey(key)) throw new Error("Invalid storage key");
    return `/media/${key}`;
  },
};

if (process.env.STORAGE_DRIVER && process.env.STORAGE_DRIVER !== "local") {
  throw new Error("Unsupported STORAGE_DRIVER");
}
export const storage: StorageAdapter = local;
