/** Give fast submissions time to satisfy the lead action's minimum form age. */
export async function waitForFormTime(data: FormData) {
  const age = Date.now() - Number(data.get("startedAt"));
  const remaining = Math.min(1_600, 1_600 - age);
  if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
}
