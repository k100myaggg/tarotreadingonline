import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const PACK_PRICING: Record<string, { credits: number; priceCents: number; name: string }> = {
  seeker: { credits: 10, priceCents: 499, name: "Seeker Pack (10 Credits)" },
  mystic: { credits: 30, priceCents: 1199, name: "Mystic Pack (30 Credits)" },
  oracle: { credits: 100, priceCents: 2999, name: "Oracle Pack (100 Credits)" },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { packId, userId = "guest_default", locale = "en" } = body;

    const pack = PACK_PRICING[packId];
    if (!pack) {
      return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: pack.name,
                description: `Adds ${pack.credits} sacred reading credits to your account.`,
              },
              unit_amount: pack.priceCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          packId,
          credits: String(pack.credits),
        },
        success_url: `${appUrl}/${locale}/dashboard?payment=success&credits=${pack.credits}`,
        cancel_url: `${appUrl}/${locale}/dashboard?payment=cancelled`,
      });

      return NextResponse.json({ url: session.url });
    }

    // Mock fallback URL for development without active secret key
    return NextResponse.json({
      url: `${appUrl}/${locale}/dashboard?payment=simulated_success&credits=${pack.credits}`,
    });
  } catch (error: any) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
