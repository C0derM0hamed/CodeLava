import "server-only";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

export async function whenTableExists<T>(read: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    let cause: unknown = error;
    while (cause && typeof cause === "object") {
      if ("code" in cause && cause.code === "42P01") return fallback;
      cause = "cause" in cause && cause.cause !== cause ? cause.cause : undefined;
    }
    throw error;
  }
}

export function publishedQuery<Args extends unknown[], Result>(
  name: string,
  tags: string[],
  read: (...args: Args) => Promise<Result>,
  fallback: Result,
) {
  const cached = unstable_cache(read, [name], { tags });
  return (...args: Args) => whenTableExists(() => cached(...args), fallback);
}

export function publicQuery<Args extends unknown[], Result>(
  name: string,
  tags: string[],
  read: (draft: boolean, ...args: Args) => Promise<Result>,
  fallback: Result,
) {
  const published = publishedQuery(name, tags, (...args: Args) => read(false, ...args), fallback);
  return async (...args: Args) => (await draftMode()).isEnabled
    ? whenTableExists(() => read(true, ...args), fallback)
    : published(...args);
}
