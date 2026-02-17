import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1).max(4000),
      })
    )
    .min(1)
    .max(20),
});

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || entry.resetAt <= now) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  rateLimitStore.set(ip, entry);

  return {
    allowed: true,
    remaining: Math.max(0, MAX_REQUESTS - entry.count),
    resetAt: entry.resetAt,
  };
}

export async function POST(request: NextRequest) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey) {
    return NextResponse.json(
      {
        error:
          "Server is missing OPENAI_API_KEY. Add it to your environment variables and restart the server.",
      },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error:
          "Rate limit exceeded. You can send up to 10 chat requests every 10 minutes. Please try again later.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  let body: z.infer<typeof requestSchema>;
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    body = parsed.data;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiApiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: body.messages,
      }),
    });

    const payload = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return NextResponse.json(
        {
          error:
            payload?.error?.message ||
            "Failed to get a response from OpenAI. Please try again.",
        },
        { status: openAiResponse.status }
      );
    }

    const reply = payload?.choices?.[0]?.message?.content;

    if (!reply || typeof reply !== "string") {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply, model });
  } catch {
    return NextResponse.json(
      { error: "Unable to reach OpenAI service right now. Please try again shortly." },
      { status: 502 }
    );
  }
}
