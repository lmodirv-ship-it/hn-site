import { formatMoney } from "@/components/portal/ui";

export type InvoiceLine = { description: string; amount: number };

export type InvoiceRecord = {
  invoice_number: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  line_items: unknown;
};

function parseLines(raw: unknown, fallback: InvoiceRecord): InvoiceLine[] {
  if (Array.isArray(raw) && raw.length > 0) {
    return raw
      .filter((l): l is Record<string, unknown> => typeof l === "object" && l !== null)
      .map((l) => ({
        description: String(l["description"] ?? "Service"),
        amount: Number(l["amount"] ?? 0),
      }));
  }
  return [{ description: fallback.description || "Web development services", amount: Number(fallback.amount) }];
}

/** Generates and downloads a branded PDF invoice in the browser. */
export async function downloadInvoicePdf(invoice: InvoiceRecord, billedTo: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const left = 48;
  let y = 64;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("HN GROUP", left, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(110);
  y += 16;
  doc.text("www.hn-groupe.org  ·  info@hnchat.net", left, y);

  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Invoice ${invoice.invoice_number}`, left, (y += 48));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Billed to: ${billedTo}`, left, (y += 20));
  doc.text(`Issued: ${invoice.issued_at.slice(0, 10)}`, left, (y += 14));
  if (invoice.due_at) doc.text(`Due: ${invoice.due_at.slice(0, 10)}`, left, (y += 14));
  doc.text(`Status: ${invoice.status.toUpperCase()}`, left, (y += 14));

  y += 28;
  doc.setDrawColor(210);
  doc.line(left, y, 548, y);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("Description", left, (y += 18));
  doc.text("Amount", 470, y);
  doc.setFont("helvetica", "normal");

  for (const line of parseLines(invoice.line_items, invoice)) {
    y += 18;
    doc.text(doc.splitTextToSize(line.description, 380) as string[], left, y);
    doc.text(formatMoney(line.amount, invoice.currency), 470, y);
  }

  y += 16;
  doc.line(left, y, 548, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Total", left, (y += 22));
  doc.text(formatMoney(Number(invoice.amount), invoice.currency), 470, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text("Thank you for building with HN Group.", left, 780);

  doc.save(`${invoice.invoice_number}.pdf`);
}
