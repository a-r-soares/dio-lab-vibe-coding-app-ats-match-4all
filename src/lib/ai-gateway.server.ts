import { createOpenAI } from "@ai-sdk/openai";

/**
 * Helper do Lovable AI Gateway (Responses API) — somente servidor.
 * Captura/propaga X-Lovable-AIG-Run-ID por requisição.
 */
export function createLovableAiGatewayRunIdFetch(initialRunId?: string) {
  let runId = initialRunId;
  const customFetch: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (runId) headers.set("X-Lovable-AIG-Run-ID", runId);
    const res = await fetch(input, { ...init, headers });
    const minted = res.headers.get("X-Lovable-AIG-Run-ID");
    if (minted) runId = minted;
    return res;
  };
  return {
    fetch: customFetch,
    get runId() {
      return runId;
    },
  };
}

export function createLovableResponsesProvider(apiKey: string, runIdFetch: ReturnType<typeof createLovableAiGatewayRunIdFetch>) {
  return createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey, // satisfaz o SDK; o gateway autentica pelo header abaixo
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
    fetch: runIdFetch.fetch,
  });
}

export const REASONING_OPTIONS = {
  openai: {
    forceReasoning: true,
    reasoningEffort: "low",
    reasoningSummary: "auto",
    store: false,
    include: ["reasoning.encrypted_content"],
  },
} as const;
