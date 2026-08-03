import { useEffect, useState, type FormEvent } from "react";
import { Mail, Globe, MessageCircle, User, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const EMAIL = "info@hnchat.net";
const SITE = "www.hn-groupe.org";
const WHATSAPP = "212600000000";

export function Contact() {
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  // Prefill from the AI Project Planner ("Launch this project now").
  useEffect(() => {
    const brief = sessionStorage.getItem("hn_project_brief");
    if (brief) {
      setMessage(brief);
      sessionStorage.removeItem("hn_project_brief");
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();

    if (name.length < 2 || name.length > 100) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 255) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (message.length < 10 || message.length > 1000) {
      toast.error("Message must be between 10 and 1000 characters.");
      return;
    }

    setSending(true);
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(
      `New project enquiry — ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    toast.success("Opening your email client…");
    setSending(false);
  };


  return (
    <footer id="contact" className="relative scroll-mt-24 border-t pt-24 pb-10">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="text-sm font-medium text-cyan">Contact</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Let&apos;s ship your product <span className="text-gradient">this week</span>
            </h2>
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <User className="size-4 shrink-0 text-cyan" aria-hidden />
                <span>Moulay Ismail EL HASSANI — HN Group</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-cyan" aria-hidden />
                <a className="hover:text-cyan" href={`mailto:${EMAIL}`}>
                  {EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="size-4 shrink-0 text-cyan" aria-hidden />
                <a
                  className="hover:text-cyan"
                  href="https://www.hn-groupe.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  {SITE}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="size-4 shrink-0 text-cyan" aria-hidden />
                <a
                  className="hover:text-cyan"
                  href={`https://wa.me/${WHATSAPP}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </div>

          <form onSubmit={onSubmit} className="glass rounded-2xl p-6 sm:p-8" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" name="name" maxLength={100} placeholder="Jane Doe" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  maxLength={255}
                  placeholder="jane@company.com"
                  required
                />
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <Label htmlFor="message">Project details</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                maxLength={1000}
                placeholder="Tell us what you want to launch and when."
                required
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-5 w-full" disabled={sending}>
              <Send className="size-4" aria-hidden />
              Send message
            </Button>
          </form>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p className="flex items-center gap-2">
            <Sparkles className="size-4 text-cyan" aria-hidden />
            © {new Date().getFullYear()} HN Group. All rights reserved.
          </p>
          <p>Built with AI. Deployed in hours.</p>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with HN Group on WhatsApp"
      className="animate-float glow-cyan fixed right-5 bottom-5 z-50 grid size-14 place-items-center rounded-full bg-cyan text-cyan-foreground transition-transform hover:scale-110"
    >
      <MessageCircle className="size-6" aria-hidden />
    </a>
  );
}
