import { notFound } from "next/navigation";

/** Routes unmatched localized URLs through the localized not-found boundary. */
export default function CatchAll() {
  notFound();
}
