import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { typescript: true })
  : null;

export async function POST(req: Request) {
  try {
    // ✅ Don't crash build if env missing
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured (missing STRIPE_SECRET_KEY)." },
        { status: 501 }
      );
    }

    const origin =
      req.headers.get("origin") ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: "Demo Checkout – Witter Labs" },
            unit_amount: 1900,
          },
          quantity: 1,
        },
      ],
      // ✅ match your existing routes
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    console.error("STRIPE_ERROR:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Stripe checkout failed",
        type:
          typeof err === "object" && err && "type" in err
            ? (err as { type?: string }).type
            : undefined,
        code:
          typeof err === "object" && err && "code" in err
            ? (err as { code?: string }).code
            : undefined,
      },
      { status: 500 }
    );
  }
}