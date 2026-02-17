"use client";

import { useCallback, useState } from "react";

export type DemoEvent = {
  id: string;
  type: string;
  timestamp: number;
  meta?: Record<string, unknown>;
};

export function useEventLog() {
  const [events, setEvents] = useState<DemoEvent[]>([]);

  const logEvent = useCallback(
    (type: string, meta?: Record<string, unknown>) => {
      setEvents((prev) => [
        {
          id: crypto.randomUUID(),
          type,
          timestamp: Date.now(),
          meta,
        },
        ...prev,
      ]);
    },
    []
  );

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    logEvent,
    clearEvents,
  };
}
