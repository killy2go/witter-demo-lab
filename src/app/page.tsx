"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventLog } from "@/lib/useEventLog";
import { EventConsole } from "@/components/EventConsole";

export default function Page() {
  const { events, logEvent, clearEvents } = useEventLog();
  const click = (type: string, meta?: Record<string, any>) => () => logEvent(type, meta);

  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "success" | "error">("idle");
  const [leadLoading, setLeadLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  useEffect(() => {
    const stripeResult = searchParams.get("stripe");
    if (!stripeResult) return;

    if (stripeResult === "success") logEvent("stripe_checkout_success");
    if (stripeResult === "cancel") logEvent("stripe_checkout_cancel");

    router.replace("/", { scroll: false });
  }, [searchParams, logEvent, router]);

  return (
    <main className="demo-bg">
      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <span className="text-sm font-semibold text-slate-900">WL</span>
            </div>
            <div>
              <p className="text-sm text-slate-600">Witter</p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">
                Demo Lab
              </h1>
            </div>
          </div>

          <nav className="flex gap-2">
            <a
              href="#modules"
              onClick={click("nav_demo_start", { position: "header" })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Demo starten
            </a>
            <a
              href="https://witterlabs.de"
              onClick={() => logEvent("exit_to_witterlabs")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              Zurück zu Witter Labs
            </a>
          </nav>
        </header>

        {/* Status Bar */}
        <div className="mt-6 flex flex-wrap gap-2">
          {["Sandbox Mode", "Keine echten Zahlungen", "Events werden geloggt"].map(
            (item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
              >
                {item}
              </span>
            )
          )}
        </div>

        {/* Hero */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Interaktive Demo, die sich wie ein Produkt anfühlt.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Teste Stripe (Sandbox), einen KI-Chat und einen Lead-Flow. Alles live,
            alles im Testmodus – mit sichtbarem Event-Tracking.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#modules"
              onClick={click("hero_demo_start", { position: "hero" })}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Demo starten
            </a>
            <a
              href="#how"
              onClick={click("hero_how_open", { position: "hero" })}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              How it’s built
            </a>
          </div>
        </section>

        {/* Modules */}
        <section
          id="modules"
          className="mt-10 grid gap-4 sm:grid-cols-2"
        >
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                (e.currentTarget as HTMLDivElement).click();
              }
            }}

            onClick={async () => {
              if (checkoutLoading) return;
              setCheckoutLoading(true);

              try {
                logEvent("stripe_checkout_started", { source: "module_card" });

                const res = await fetch("/api/stripe/checkout", { method: "POST" });
                const data = await res.json();

                if (!res.ok) {
                  logEvent("stripe_checkout_error", { error: data?.error ?? "unknown" });
                  setCheckoutLoading(false);
                  return;
                }

                if (data?.url) {
                  logEvent("stripe_checkout_redirect");
                  window.location.href = data.url;
                  return;
                }

                logEvent("stripe_checkout_error", { error: "no_url_returned" });
                setCheckoutLoading(false);
              } catch (e: any) {
                logEvent("stripe_checkout_error", { error: e?.message ?? "fetch_failed" });
                setCheckoutLoading(false);
              }
            }}
            className={`cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
              checkoutLoading ? "pointer-events-none opacity-70" : ""
            }`}

          >
            <h3 className="font-medium text-slate-900">Stripe Sandbox</h3>

            <p className="mt-2 text-sm text-slate-600">
              Teste einen echten Stripe Checkout im Sandbox-Modus.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
              {checkoutLoading ? "Öffne Checkout…" : "Checkout starten →"}
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Testmodus · z.B. <span className="font-mono">4242 4242 4242 4242</span>
            </div>   
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-medium text-slate-900">Lead Flow (Dummy)</h3>
            <p className="mt-2 text-sm text-slate-600">
              Simulierter Newsletter Signup – Demo only, keine Speicherung.
            </p>

            <div className="mt-4 grid gap-3">
              <input
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                onFocus={() => logEvent("lead_input_focus", { field: "name" })}
                placeholder="Name"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
              />

              <input
                value={leadEmail}
                onChange={(e) => setLeadEmail(e.target.value)}
                onFocus={() => logEvent("lead_input_focus", { field: "email" })}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
              />

              <input
                value={leadCompany}
                onChange={(e) => setLeadCompany(e.target.value)}
                onFocus={() => logEvent("lead_input_focus", { field: "company" })}
                placeholder="Firma (optional)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
              />

              <button
                disabled={leadLoading}
                onClick={async () => {
                  if (leadLoading) return;

                  logEvent("lead_submit", { source: "module_card" });
                  setLeadLoading(true);

                  // simple validation
                  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail.trim());
                  if (!leadName.trim() || !emailOk) {
                    setLeadStatus("error");
                    logEvent("lead_submit_error", { reason: "validation" });
                    setLeadLoading(false);
                    return;
                  }

                  // simulate network
                  await new Promise((r) => setTimeout(r, 650));

                  setLeadStatus("success");
                  logEvent("lead_submit_success", {
                    name: leadName.trim(),
                    emailDomain: leadEmail.split("@")[1] ?? null,
                    hasCompany: !!leadCompany.trim(),
                  });

                  setLeadLoading(false);
                }}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm ${
                  leadLoading ? "bg-slate-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {leadLoading ? "Sende…" : "Demo Signup"}
              </button>

              {leadStatus === "success" && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Danke! Demo-Signup erfolgreich simuliert ✅
                  <button
                    onClick={() => {
                      setLeadName("");
                      setLeadEmail("");
                      setLeadCompany("");
                      setLeadStatus("idle");
                      logEvent("lead_reset");
                    }}
                    className="ml-3 text-emerald-900 underline underline-offset-2"
                  >
                    Reset
                  </button>
                </div>
              )}

              {leadStatus === "error" && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                  Bitte Name + gültige Email eingeben.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:col-span-2">
            <h3 className="font-medium text-slate-900">
              Live Event Console
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Zeigt Events wie CTA Click, Checkout Started, Chat Opened.
            </p>

            <EventConsole events={events} onClear={clearEvents} />
          </div>
        </section>

        {/* How */}
        <section
          id="how"
          className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="font-semibold text-slate-900">
            How this demo is built
          </h3>
          <ul className="mt-4 space-y-1 text-sm text-slate-700">
            <li>• Next.js (App Router)</li>
            <li>• Tailwind CSS</li>
            <li>• Stripe (Testmode)</li>
            <li>• Event Tracking (in-app)</li>
          </ul>
        </section>

        <footer className="mt-10 pb-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Witter Labs · Demo only
        </footer>
      </div>
    </main>
  );
}
