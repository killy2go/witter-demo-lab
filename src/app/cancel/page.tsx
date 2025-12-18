"use client";

import { useEffect } from "react";
import { useEventLog } from "@/lib/useEventLog";

export default function Cancel() {
  const { logEvent } = useEventLog();

  useEffect(() => {
    logEvent("stripe_checkout_cancel");
  }, [logEvent]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Checkout abgebrochen</h1>
        <p className="mt-2 text-slate-600">Kein Problem – Demo only.</p>
      </div>
    </main>
  );
}
