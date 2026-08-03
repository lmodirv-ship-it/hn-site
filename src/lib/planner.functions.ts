import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const IdeaInput = z.object({
  idea: z.string().trim().min(8, "Describe your idea in a few more words.").max(600),
});

const ScopeSchema = z.object({
  project_title: z.string(),
  summary: z.string(),
  modules: z.array(z.object({ name: z.string(), description: z.string() })).max(8),
  features: z.array(z.string()).max(12),
  tech_stack: z.array(z.string()).max(10),
  timeline: z.string(),
  budget_min: z.number(),
  budget_max: z.number(),
  recommended_package: z.string(),
});

export type ProjectScope = z.infer<typeof ScopeSchema>;

const SYSTEM = `You are the lead solutions architect at HN Group, an AI-first web agency that ships
production web apps in 24-48 hours using React, TanStack Start, Supabase and Tailwind.
Given a client's raw idea, produce a realistic project scope.
Rules:
- timeline is short and confident, e.g. "24 hours", "48 hours", "3-5 days".
- budget_min/budget_max are USD numbers. Landing pages 300-900, web apps 900-2500,
  SaaS platforms 2500-6000, e-commerce 1500-4000. Never return 0.
- recommended_package is one of: "Express Launch", "Full-Stack Pro", "Managed Subscription".
- Write in clear, client-friendly English. No markdown.`;

export const generateProjectScope = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IdeaInput.parse(input))
  .handler(async ({ data }): Promise<ProjectScope> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet. Please try again later.");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3.6-flash"),
        system: SYSTEM,
        prompt: `Client idea: ${data.idea}`,
        output: Output.object({ schema: ScopeSchema }),
      });
      return output;
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("429")) {
        throw new Error("Our planner is busy right now — please retry in a minute.");
      }
      if (message.includes("402")) {
        throw new Error("The AI planner is temporarily unavailable. Please contact us directly.");
      }
      throw new Error("We couldn't generate a scope for that idea. Try rephrasing it.");
    }
  });
