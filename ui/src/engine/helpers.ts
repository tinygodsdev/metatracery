import { type Generated } from "./Engine";
import { type GenerationResult } from "./types";

export function rawToGenerationResult(raw: Generated[]): GenerationResult[] {
  return raw.map(r => ({
    content: r.text,
    metadata: {
      parameters: r.trace,
      appliedRules: r.trace,
      generationPath: Object.keys(r.trace),
      relevantParameters: Object.fromEntries(Object.entries(r.trace).map(([key, value]) => [key, value.join(',')]))
    }
  }));
}
