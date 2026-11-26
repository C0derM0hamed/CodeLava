import { z } from "zod";

export const mediaFolder = z.string().trim().regex(/^[\p{L}\p{N}_ -]{1,96}$/u)
  .refine((folder) => folder.toLowerCase() !== "private", "Choose a different folder name.");
