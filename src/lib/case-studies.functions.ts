import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type CaseStudy = Database["public"]["Tables"]["case_studies"]["Row"];
export type CaseStudyCard = Pick<
  CaseStudy,
  | "id"
  | "slug"
  | "title"
  | "client_name"
  | "category"
  | "summary"
  | "cover_image"
  | "tech_stack"
  | "live_url"
  | "created_at"
  | "domain"
  | "rating"
  | "features"
>;

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const listCaseStudies = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient()
    .from("case_studies")
    .select(
      "id, slug, title, client_name, category, summary, cover_image, tech_stack, live_url, created_at, domain, rating, features",
    )
    .eq("published", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CaseStudyCard[];
});

export const getCaseStudy = createServerFn({ method: "GET" })
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }) => {
    const { data, error } = await publicClient()
      .from("case_studies")
      .select("*")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data as CaseStudy | null) ?? null;
  });
