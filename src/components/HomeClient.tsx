"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEventLog } from "@/lib/useEventLog";
import { EventConsole } from "@/components/EventConsole";
import { ChatWidget } from "@/components/ChatWidget";
import { BuildBanner } from "@/components/BuildBanner";
import { FloatingMetricsBar } from "@/components/FloatingMetricsBar";
import { PerformancePanel, PerformanceStats } from "@/components/PerformancePanel";

const systemViewClasses =
  "relative outline outline-1 outline-sky-500/30 outline-offset-2 before:pointer-events-none before:absolute before:-top-2 before:right-2 before:rounded-full before:border before:border-sky-500/40 before:bg-sky-500/10 before:px-2 before:py-0.5 before:text-[10px] before:font-medium before:text-sky-200";

export default function Page() {
  const { events, logEvent: baseLogEvent, clearEvents } = useEventLog();

  const searchParams = useSearchParams();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [systemView, setSystemView] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [revenuePulse, setRevenuePulse] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle" | "success" | "error">("idle");
  const [leadLoading, setLeadLoading] = useState(false);

  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    performance: 96,
    interactivity: 84,
    bundleSize: 126.4,
  });

  const emitEvent = useCallback(
    (type: string, meta?: Record<string, unknown>) => {
      baseLogEvent(type, meta);

      setToastVisible(true);
      window.setTimeout(() => setToastVisible(false), 1300);

      if (["chat_opened", "stripe_checkout_started", "lead_submit"].includes(type)) {
        setPerformanceStats((prev) => ({
          performance: Math.max(87, Math.min(99, prev.performance + (Math.random() > 0.5 ? 1 : -1))),
          interactivity: Math.max(70, Math.min(110, prev.interactivity + (Math.random() > 0.5 ? 4 : -3))),
          bundleSize: Math.max(122, Math.min(132, Number((prev.bundleSize + (Math.random() > 0.5 ? 0.5 : -0.4)).toFixed(1)))),
        }));
      }

      if (type === "stripe_checkout_success") {
        setRevenuePulse(true);
        setShowConfetti(true);
        window.setTimeout(() => {
          setRevenuePulse(false);
          setShowConfetti(false);
        }, 1400);
      }
    },
    [baseLogEvent]
  );

  const click = (type: string, meta?: Record<string, unknown>) => () => emitEvent(type, meta);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const leadsToday = useMemo(
    () => events.filter((event) => event.type === "lead_submit_success").length,
    [events]
  );

  const chatInteractions = useMemo(
    () => events.filter((event) => event.type.includes("chat_")).length,
    [events]
  );

  const successfulCheckouts = useMemo(
    () => events.filter((event) => event.type === "stripe_checkout_success").length,
    [events]
  );

  const revenueToday = successfulCheckouts * 149;
  const performanceScore = Math.max(90, 98 - Math.min(events.length / 7, 7));

  useEffect(() => {
    const stripeResult = searchParams.get("stripe");
    if (!stripeResult) return;

    if (stripeResult === "success") {
      window.setTimeout(() => emitEvent("stripe_checkout_success"), 0);
    }
    if (stripeResult === "cancel") window.setTimeout(() => emitEvent("stripe_checkout_cancel"), 0);

    router.replace("/", { scroll: false });
  }, [searchParams, emitEvent, router]);

  return (
    <main className="demo-bg">
      <FloatingMetricsBar
        performanceScore={Math.round(performanceScore)}
        revenueToday={revenueToday}
        leadsToday={leadsToday}
        chatInteractions={chatInteractions}
        revenuePulse={revenuePulse}
      />
      <PerformancePanel stats={performanceStats} />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <BuildBanner onRedeploy={() => emitEvent("ci_redeploy_clicked")} />

        {showConfetti && (
          <div className="pointer-events-none fixed inset-x-0 top-12 z-30 flex justify-center gap-3">
            {[...Array(8)].map((_, i) => (
              <span
                key={i}
                className="confetti-dot"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-300 bg-white shadow-sm">
              <span className="text-sm font-semibold text-slate-900">WL</span>
            </div>
            <div>
              <p className="text-sm text-slate-600">Witter</p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">Demo Lab</h1>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSystemView((prev) => !prev);
                emitEvent("system_view_toggle", { enabled: !systemView });
              }}
              className="btn-micro rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              System View: {systemView ? "ON" : "OFF"}
            </button>
            <a
              href="#modules"
              onClick={click("nav_demo_start", { position: "header" })}
              className="btn-micro rounded-xl border border-slate-300 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900"
            >
              Demo starten
            </a>
            <a
              href="https://witterlabs.de"
              onClick={() => emitEvent("exit_to_witterlabs")}
              className="btn-micro rounded-xl border border-slate-300 bg-white/90 px-4 py-2 text-sm font-medium text-slate-900"
            >
              Zurück zu Witter Labs
            </a>
          </nav>
        </header>

        <div className="mt-6 flex flex-wrap gap-2">
          {["Sandbox Mode", "Keine echten Zahlungen", "Events werden geloggt"].map((item) => (
            <span key={item} className="rounded-full border border-slate-300 bg-white/90 px-3 py-1 text-xs text-slate-700 shadow-sm">
              {item}
            </span>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-slate-300 bg-white/90 p-6 shadow-lg shadow-slate-900/5 sm:p-8">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Interaktive Demo, die sich wie ein Produkt anfühlt.
          </h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Teste Stripe (Sandbox), einen KI-Chat und einen Lead-Flow. Alles live, alles im Testmodus – mit sichtbarem Event-Tracking.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="#modules"
              onClick={click("hero_demo_start", { position: "hero" })}
              className="btn-micro rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            >
              Demo starten
            </a>
            <a
              href="#how"
              onClick={click("hero_how_open", { position: "hero" })}
              className="btn-micro rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900"
            >
              How it’s built
            </a>
          </div>
        </section>

        <section id="modules" className="mt-10 rounded-3xl border border-slate-300/80 bg-slate-100/65 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-sm sm:p-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
                  emitEvent("stripe_checkout_started", { source: "module_card" });

                  const res = await fetch("/api/stripe/checkout", { method: "POST" });
                  const data = await res.json();

                  if (!res.ok) {
                    emitEvent("stripe_checkout_error", { error: data?.error ?? "unknown" });
                    setCheckoutLoading(false);
                    return;
                  }

                  if (data?.url) {
                    emitEvent("stripe_checkout_redirect");
                    window.location.href = data.url;
                    return;
                  }

                  emitEvent("stripe_checkout_error", { error: "no_url_returned" });
                  setCheckoutLoading(false);
                } catch (error: unknown) {
                  const message = error instanceof Error ? error.message : "fetch_failed";
                  emitEvent("stripe_checkout_error", { error: message });
                  setCheckoutLoading(false);
                }
              }}
              className={`${systemView ? `${systemViewClasses} before:content-['API_/api/stripe/checkout']` : ""} cursor-pointer rounded-2xl border border-slate-300 bg-white/95 p-6 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl ${
                checkoutLoading ? "pointer-events-none opacity-70" : ""
              }`}
            >
              <h3 className="font-medium text-slate-900">Stripe Sandbox</h3>
              <p className="mt-2 text-sm text-slate-600">Teste einen echten Stripe Checkout im Sandbox-Modus.</p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white">
                {checkoutLoading ? "Öffne Checkout…" : "Checkout starten →"}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Testmodus · z.B. <span className="font-mono">4242 4242 4242 4242</span>
              </div>
            </div>

            <div className={`${systemView ? `${systemViewClasses} before:content-['Event_lead_submit']` : ""} rounded-2xl border border-slate-300 bg-white/95 p-6 shadow-md`}>
              <h3 className="font-medium text-slate-900">Lead Flow (Dummy)</h3>
              <p className="mt-2 text-sm text-slate-600">Simulierter Newsletter Signup – Demo only, keine Speicherung.</p>

              <div className="mt-4 grid gap-3">
                <input
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  onFocus={() => emitEvent("lead_input_focus", { field: "name" })}
                  placeholder="Name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                />

                <input
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  onFocus={() => emitEvent("lead_input_focus", { field: "email" })}
                  placeholder="Email"
                  type="email"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                />

                <input
                  value={leadCompany}
                  onChange={(e) => setLeadCompany(e.target.value)}
                  onFocus={() => emitEvent("lead_input_focus", { field: "company" })}
                  placeholder="Firma (optional)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                />

                <button
                  disabled={leadLoading}
                  onClick={async () => {
                    if (leadLoading) return;

                    emitEvent("lead_submit", { source: "module_card" });
                    setLeadLoading(true);

                    if (!leadName.trim() || !isValidEmail(leadEmail.trim())) {
                      setLeadStatus("error");
                      emitEvent("lead_submit_error", { reason: "validation" });
                      setLeadLoading(false);
                      return;
                    }

                    await new Promise((r) => setTimeout(r, 650));

                    setLeadStatus("success");
                    emitEvent("lead_submit_success", {
                      name: leadName.trim(),
                      emailDomain: leadEmail.split("@")[1] ?? null,
                      hasCompany: !!leadCompany.trim(),
                    });

                    setLeadLoading(false);
                  }}
                  className={`btn-micro inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm ${
                    leadLoading ? "bg-slate-400" : "bg-blue-600"
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
                        emitEvent("lead_reset");
                      }}
                      className="btn-micro ml-3 text-emerald-900 underline underline-offset-2"
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

            <div className={`${systemView ? `${systemViewClasses} before:content-['Events_streaming']` : ""} rounded-2xl border border-slate-700/70 bg-slate-900/90 p-6 shadow-md sm:col-span-2`}>
              <h3 className="font-medium text-white">Live Event Console</h3>
              <p className="mt-2 text-sm text-slate-300">Zeigt Events wie CTA Click, Checkout Started, Chat Opened.</p>

              <EventConsole events={events} onClear={clearEvents} systemView={systemView} />
            </div>
          </div>
        </section>

        <section id="how" className="mt-10 rounded-2xl border border-slate-700/40 bg-slate-900/85 p-6 shadow-md">
          <h3 className="font-semibold text-white">How this demo is built</h3>
          <ul className="mt-4 space-y-1 text-sm text-slate-200">
            <li>• Next.js App Router (Server + Client Components)</li>
            <li>• Suspense-based CSR handling for dynamic routes</li>
            <li>• Stripe Checkout Integration (Testmode)</li>
            <li>• AI Assistant powered by OpenAI API</li>
            <li>• Real-time Event Tracking Console</li>
            <li>• Revenue Simulation & Conversion Metrics</li>
            <li>• Modular Architecture with centralized state</li>
            <li>• Production-ready deployment on Vercel</li>
          </ul>
        </section>

        <section className="mt-10 rounded-2xl border border-blue-300/70 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 p-6 text-white shadow-xl shadow-blue-900/20">
          <h3 className="text-lg font-semibold">Build conversion-ready product demos faster.</h3>
          <p className="mt-2 max-w-2xl text-sm text-blue-100">This lab keeps live interactions visible while staying clean enough for stakeholder walkthroughs.</p>
        </section>

        <footer className="mt-10 pb-10 text-xs text-slate-500">© {new Date().getFullYear()} Witter Labs · Demo only</footer>
      </div>

      {toastVisible && (
        <div className="pointer-events-none fixed bottom-6 right-6 z-[60] rounded-xl border border-slate-300 bg-white/90 px-3 py-2 text-xs text-slate-700 shadow-lg backdrop-blur toast-enter">
          Event logged
        </div>
      )}

      <ChatWidget logEvent={emitEvent} />
    </main>
  );
}
