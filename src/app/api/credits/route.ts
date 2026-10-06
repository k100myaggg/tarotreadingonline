import { NextRequest, NextResponse } from "next/server";
import { CreditLedgerService } from "@/lib/credits/ledger";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "guest_default";

    const balance = await CreditLedgerService.getBalance(userId);
    return NextResponse.json({ success: true, balance });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch credit balance" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "guest_default", action = "claim_daily" } = body;

    if (action === "claim_daily") {
      const claimResult = await CreditLedgerService.claimDailyCredit(userId);
      return NextResponse.json(claimResult);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process credit action" },
      { status: 500 }
    );
  }
}
