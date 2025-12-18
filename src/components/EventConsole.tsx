"use client";

import { DemoEvent } from "@/lib/useEventLog";

export function EventConsole({
  events,
  onClear,
}: {
  events: DemoEvent[];
  onClear: () => void;
}) {
  return (
    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-900">
          Live Event Console
        </h4>
        <button
          onClick={onClear}
          className="text-xs text-slate-600 hover:text-slate-900"
        >
          Clear
        </button>
      </div>

      {events.length === 0 ? (
        <p className="text-xs text-slate-500">
          Noch keine Events – klick etwas an 👀
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-800">{event.type}</span>
                    {event.meta ? (
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
                        meta
                      </span>
                    ) : null}
                  </div>

                  {event.meta ? (
                    <pre className="mt-2 overflow-auto rounded-md bg-slate-50 p-2 text-[11px] text-slate-700">
          {JSON.stringify(event.meta, null, 2)}
                    </pre>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="text-slate-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>

                  <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(event, null, 2))}
                    className="text-[11px] text-slate-600 hover:text-slate-900"
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
