import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

export async function POST() {
  try {
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
      success_url: "http://localhost:3000/?stripe=success",
      cancel_url: "http://localhost:3000/?stripe=cancel",
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("STRIPE_ERROR:", err);
    return NextResponse.json(
      {
        error: err?.message ?? "Stripe checkout failed",
        type: err?.type,
        code: err?.code,
      },
      { status: 500 }
    );
  }
}
