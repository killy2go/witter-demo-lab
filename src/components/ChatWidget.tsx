"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatWidgetProps = {
  logEvent?: (type: string, meta?: Record<string, unknown>) => void;
  onOpenChange?: (isOpen: boolean) => void;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function ChatWidget({ logEvent, onOpenChange }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I’m your demo assistant. Ask me anything about this project.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onOpenChange?.(isOpen);
    if (isOpen) {
      logEvent?.("chat_opened");
    } else {
      logEvent?.("chat_closed");
    }
  }, [isOpen, onOpenChange, logEvent]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 30);

    return () => window.clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const closeWidget = () => {
    setIsOpen(false);
    window.setTimeout(() => {
      openButtonRef.current?.focus();
    }, 0);
  };

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeWidget();
      return;
    }

    if (event.key !== "Tab") return;

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (!focusable || focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const message = input.trim();
    if (!message || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: message };
    const updatedMessages = [...messages, userMessage];

    logEvent?.("chat_message_sent", {
      messageLength: message.length,
    });

    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const payload = await response.json();

      if (!response.ok) {
        logEvent?.("chat_error", {
          error: payload?.error || "chat_request_failed",
        });
        setError(payload?.error || "Chat request failed. Please try again.");
        return;
      }

      const assistantReply = payload.reply || "I’m sorry, I couldn’t generate a response.";
      logEvent?.("chat_response_received", {
        messageLength: assistantReply.length,
      });

      setMessages((prev) => [...prev, { role: "assistant", content: assistantReply }]);
    } catch {
      logEvent?.("chat_error", {
        error: "chat_service_unreachable",
      });
      setError("Unable to reach chat service. Please check your connection and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen ? (
        <div
          ref={panelRef}
          onKeyDown={onPanelKeyDown}
          className="chat-panel-enter flex h-[70vh] max-h-[560px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white/90 shadow-2xl shadow-slate-900/20 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Chat assistant"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Chat Assistant</h2>
            <button
              type="button"
              onClick={closeWidget}
              className="btn-micro rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/80 px-4 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed transition-transform ${
                  message.role === "user"
                    ? "ml-auto rounded-br-sm bg-blue-600 text-white"
                    : "rounded-bl-sm border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="w-fit rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
                Assistant is typing…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mx-4 mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="border-t border-slate-200 p-3">
            <label htmlFor="chat-input" className="sr-only">
              Type your message
            </label>
            <div className="flex items-center gap-2">
              <input
                id="chat-input"
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="btn-micro rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          ref={openButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-micro inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open chat assistant"
        >
          <span aria-hidden>💬</span>
          <span>Chat</span>
        </button>
      )}
    </div>
  );
}
