import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { ASSISTANT_SYSTEM_PROMPT, assistantFallback } from "./assistant.server";

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000),
      }),
    )
    .min(1)
    .max(24),
});

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }): Promise<{ reply: string }> => {
    const last = data.messages[data.messages.length - 1]?.content ?? "";
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { reply: assistantFallback(last) };

    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(key);
      const { text } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        system: ASSISTANT_SYSTEM_PROMPT,
        messages: data.messages,
      });
      return { reply: text.trim() || assistantFallback(last) };
    } catch {
      return { reply: assistantFallback(last) };
    }
  });
