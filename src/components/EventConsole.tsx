"use client";

import { DemoEvent } from "@/lib/useEventLog";

const indicatorByType = (type: string) => {
  if (type.includes("stripe") || type.includes("checkout")) return "bg-emerald-400";
  if (type.includes("chat")) return "bg-sky-400";
  if (type.includes("lead")) return "bg-violet-400";
  return "bg-slate-400";
};

export function EventConsole({
  events,
  onClear,
  systemView,
}: {
  events: DemoEvent[];
  onClear: () => void;
  systemView: boolean;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-700/80 bg-slate-900/95 p-4 shadow-inner shadow-black/20">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-100">Live Event Console</h4>
        <button onClick={onClear} className="btn-micro text-xs text-slate-400 hover:text-white">
          Clear
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-400">Noch keine Events – klick etwas an 👀</p>
      ) : (
        <ul className="space-y-2 text-xs">
          {events.map((event, index) => (
            <li
              key={event.id}
              className="animate-slide-in rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 font-mono"
              style={{ animationDelay: `${Math.min(index * 35, 150)}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${indicatorByType(event.type)}`} />
                    <span className="text-slate-100">{event.type}</span>
                    {event.meta ? (
                      <span className="rounded-full border border-slate-600 bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                        meta
                      </span>
                    ) : null}
                    {systemView ? (
                      <span className="rounded-full border border-sky-500/60 bg-sky-500/10 px-2 py-0.5 text-[10px] text-sky-200">
                        event: {event.type}
                      </span>
                    ) : null}
                  </div>

                  {event.meta ? (
                    <pre className="mt-2 overflow-auto rounded-md border border-slate-700 bg-slate-950/60 p-2 text-[11px] text-slate-300">
                      {JSON.stringify(event.meta, null, 2)}
                    </pre>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>

                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(event, null, 2))}
                    className="btn-micro text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
