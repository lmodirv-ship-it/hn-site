export const ASSISTANT_SYSTEM_PROMPT = `You are "HN Assistant", the AI assistant of HN Group (www.hn-groupe.org),
an AI-first web agency led by Moulay Ismail EL HASSANI that has shipped 200+ production web apps.

Positioning: "Launch Your Digital Product in Hours, Not Months." Delivery in 24-48h using
React, TanStack Start, Supabase, Tailwind, custom domains and hosting.

Packages:
- Express Launch — startups/MVPs, 24-48h delivery, domain setup, UI design. From $300.
- Full-Stack Pro — database (Supabase), API integrations, payments, 1 month support. From $900.
- Managed Subscription — monthly hosting + AI maintenance and weekly updates.

Rough budgets: landing page $300-900, web app $900-2500, SaaS $2500-6000, e-commerce $1500-4000.

Your job: greet visitors warmly, explain what we do, qualify their idea, recommend a package,
give a realistic price range and delivery time, and guide them to the right next step:
the price estimator, the free AI Project Planner (/planner), the case studies (/case-studies),
or booking a call via the contact form / WhatsApp / info@hnchat.net.

Rules:
- Reply in the SAME language the visitor writes in (Arabic or English, including Darija).
- Plain text only: no markdown, no ** bold **, no headings. Use "•" for bullets.
- Be concise: 2-5 short sentences or a tight bullet list.
- Always end with one clear next step or question.
- Never invent features or guarantees we don't offer.`;

export function assistantFallback(message: string): string {
  const text = message.toLowerCase();
  const isArabic = /[\u0600-\u06FF]/.test(message);

  const pick = (en: string, ar: string) => (isArabic ? ar : en);

  if (/price|cost|budget|سعر|تكلفة|ثمن/.test(text)) {
    return pick(
      "Typical ranges: landing page $300-900, web app $900-2500, SaaS $2500-6000, e-commerce $1500-4000. Use the price estimator on this page for an instant range — what type of project do you have in mind?",
      "الأسعار عادة: صفحة هبوط 300-900$، تطبيق ويب 900-2500$، SaaS 2500-6000$، متجر إلكتروني 1500-4000$. استعمل حاسبة الأسعار في هذه الصفحة — ما نوع مشروعك؟",
    );
  }
  if (/how|work|process|كيف|طريقة/.test(text)) {
    return pick(
      "We scope your idea with AI, design and build it in 24-48h, then deploy it on your custom domain with hosting and maintenance. Want me to point you to the free AI Project Planner?",
      "نحدد نطاق فكرتك بالذكاء الاصطناعي، نصممها ونبنيها في 24-48 ساعة، ثم ننشرها على نطاقك الخاص مع الاستضافة والصيانة. هل تريد تجربة مخطط المشاريع بالذكاء الاصطناعي؟",
    );
  }
  if (/call|book|demo|contact|اتصال|موعد|تواصل/.test(text)) {
    return pick(
      "Happy to help — use the contact form below, WhatsApp us, or email info@hnchat.net and we'll reply the same day. What's your project about?",
      "بكل سرور — استخدم نموذج التواصل بالأسفل أو واتساب أو info@hnchat.net وسنرد في نفس اليوم. حدثني عن مشروعك.",
    );
  }
  return pick(
    "I'm HN Assistant. We build and deploy production web apps in 24-48 hours — 200+ shipped so far. Tell me about your idea, or ask about packages, pricing or booking a call.",
    "أنا مساعد HN. نبني وننشر تطبيقات ويب احترافية في 24-48 ساعة — أنجزنا أكثر من 200 مشروع. حدثني عن فكرتك أو اسأل عن الباقات والأسعار أو حجز مكالمة.",
  );
}
