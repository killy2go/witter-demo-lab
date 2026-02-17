"use client";

import { AnimatedNumber } from "@/components/AnimatedNumber";

export type PerformanceStats = {
  performance: number;
  interactivity: number;
  bundleSize: number;
};

export function PerformancePanel({ stats }: { stats: PerformanceStats }) {
  return (
    <aside className="pointer-events-none fixed bottom-24 right-4 z-40 hidden w-52 rounded-2xl border border-slate-300/80 bg-slate-900/85 p-3 text-slate-100 shadow-xl shadow-slate-900/30 backdrop-blur-lg lg:block">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
        ⚡ Performance
      </p>
      <div className="space-y-2 text-xs">
        <p className="flex items-center justify-between">
          <span>⚡ Performance</span>
          <span className="font-semibold">
            <AnimatedNumber value={stats.performance} />
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span>🧠 Interactivity</span>
          <span className="font-semibold">
            <AnimatedNumber value={stats.interactivity} suffix="ms" />
          </span>
        </p>
        <p className="flex items-center justify-between">
          <span>📦 Bundle Size</span>
          <span className="font-semibold">
            <AnimatedNumber value={stats.bundleSize} decimals={1} suffix="kb" />
          </span>
        </p>
      </div>
    </aside>
  );
}
