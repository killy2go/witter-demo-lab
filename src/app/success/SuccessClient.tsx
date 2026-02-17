"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEventLog } from "@/lib/useEventLog";

export default function SuccessClient() {
  const { logEvent } = useEventLog();
  const sp = useSearchParams();
  const sessionId = sp.get("session_id");

  useEffect(() => {
    logEvent("stripe_checkout_success", { sessionId });
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 5000);
    return () => clearTimeout(t);
  }, [logEvent, sessionId]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Payment erfolgreich 🎉</h1>
        <p className="mt-2 text-slate-600">
          Sandbox Checkout abgeschlossen. Du wirst gleich zurückgeleitet.
        </p>

        {sessionId ? (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Session: <span className="font-mono">{sessionId}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Zurück zur Demo
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border px-4 py-2 text-slate-700 hover:bg-slate-50"
          >
            Weiter ausprobieren
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-500">Auto-Redirect in ~5 Sekunden.</p>
      </div>
    </main>
  );
}