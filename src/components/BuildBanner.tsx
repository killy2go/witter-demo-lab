"use client";

import { useState } from "react";

export function BuildBanner({
  onRedeploy,
}: {
  onRedeploy?: () => void;
}) {
  const [isDeploying, setIsDeploying] = useState(false);

  return (
    <div className="mb-5 rounded-2xl border border-slate-300/80 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-700">🚀 Deployed in 42s via CI</p>
        <button
          type="button"
          onClick={() => {
            if (isDeploying) return;
            setIsDeploying(true);
            onRedeploy?.();
            window.setTimeout(() => setIsDeploying(false), 1400);
          }}
          className="btn-micro rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          {isDeploying ? "Re-deploying…" : "Re-deploy demo"}
        </button>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full bg-blue-500/80 transition-all duration-1000 ${
            isDeploying ? "w-full" : "w-[28%]"
          }`}
        />
      </div>
    </div>
  );
}
