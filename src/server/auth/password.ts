import { hash, verify } from "@node-rs/argon2";

// The package defaults to Argon2id.
const options = { memoryCost: 19456, timeCost: 3, parallelism: 1 };
export const hashPassword = (password: string) => hash(password, options);
export const verifyPassword = (encoded: string, password: string) => verify(encoded, password);
