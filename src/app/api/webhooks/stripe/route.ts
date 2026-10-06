import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { CreditLedgerService } from "@/lib/credits/ledger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const sig = req.headers.get("stripe-signature");
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event: Stripe.Event;

    if (stripeKey && webhookSecret && sig) {
      const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" as any });
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // In dev or testing without signature verification
      try {
        event = JSON.parse(rawBody);
      } catch {
        return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
      }
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || "guest_default";
      const credits = parseInt(session.metadata?.credits || "10", 10);
      const idempotencyKey = `evt_${event.id}`;

      // Idempotently apply credits
      await CreditLedgerService.addPurchasedCredits(
        userId,
        credits,
        session.id,
        idempotencyKey
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Stripe webhook processing error:", error.message);
    return NextResponse.json(
      { error: `Webhook error: ${error.message}` },
      { status: 400 }
    );
  }
}
