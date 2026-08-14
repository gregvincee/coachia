import type { InvokeResult } from "./_core/llm";

/**
 * Estimation configurable, exprimée en milli-centimes USD pour 1 000 tokens.
 * Les valeurs doivent être alignées sur le coût réel du fournisseur avant la
 * production ; aucun prix n’est exposé au client.
 */
const INPUT_MILLICENTS_PER_1K = Number(process.env.COACHIA_AI_INPUT_MILLICENTS_PER_1K ?? 10);
const OUTPUT_MILLICENTS_PER_1K = Number(process.env.COACHIA_AI_OUTPUT_MILLICENTS_PER_1K ?? 40);

export function estimateAiCostMilliCents(usage: InvokeResult["usage"] | undefined): number {
  if (!usage) return 0;
  const inputCost = (usage.prompt_tokens / 1000) * INPUT_MILLICENTS_PER_1K;
  const outputCost = (usage.completion_tokens / 1000) * OUTPUT_MILLICENTS_PER_1K;
  return Math.max(0, Math.round(inputCost + outputCost));
}
