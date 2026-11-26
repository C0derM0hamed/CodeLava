import { clsx, type ClassValue } from "clsx";

/** Lightweight class name joiner backed by clsx. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
