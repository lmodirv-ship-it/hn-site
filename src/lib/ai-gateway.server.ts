import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/** Server-only: builds the Lovable AI Gateway provider. Never import from client code. */
export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": apiKey },
  });
}
