"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";

export function FloatingMetricsBar({
  performanceScore,
  revenueToday,
  leadsToday,
  chatInteractions,
  revenuePulse,
}: {
  performanceScore: number;
  revenueToday: number;
  leadsToday: number;
  chatInteractions: number;
  revenuePulse: boolean;
}) {
  return (
    <aside className="pointer-events-none fixed right-4 top-16 z-40 hidden w-64 rounded-2xl border border-slate-300/90 bg-white/75 p-3 shadow-xl shadow-slate-900/10 backdrop-blur-lg lg:block">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Live Metrics
      </p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-slate-200/90 bg-white/80 p-2">
          <p className="text-slate-500">Performance</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            <AnimatedNumber value={performanceScore} />
          </p>
        </div>
        <div
          className={`rounded-xl border border-slate-200/90 bg-white/80 p-2 transition ${
            revenuePulse ? "ring-2 ring-emerald-400/60" : ""
          }`}
        >
          <p className="text-slate-500">Revenue Today</p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">
            <AnimatedNumber value={revenueToday} prefix="$" />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white/80 p-2">
          <p className="text-slate-500">Leads Today</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            <AnimatedNumber value={leadsToday} />
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/90 bg-white/80 p-2">
          <p className="text-slate-500">Chat Interactions</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            <AnimatedNumber value={chatInteractions} />
          </p>
        </div>
      </div>
    </aside>
  );
}
