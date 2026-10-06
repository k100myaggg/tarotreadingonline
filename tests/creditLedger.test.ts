import { describe, it, expect, beforeEach } from "vitest";
import { CreditLedgerService } from "../src/lib/credits/ledger";

describe("Credit Ledger Engine & Idempotency", () => {
  beforeEach(() => {
    CreditLedgerService._resetMemoryStore();
  });

  it("initializes a new user with 1 free credit welcome balance", async () => {
    const balance = await CreditLedgerService.getBalance("user_test_1");
    expect(balance.freeCredits).toBe(1);
    expect(balance.purchasedCredits).toBe(0);
    expect(balance.totalCredits).toBe(1);
    expect(balance.canClaimDaily).toBe(true);
  });

  it("prioritizes free credits before touching purchased credits upon deduction", async () => {
    const userId = "user_test_2";
    // Add 10 purchased credits
    await CreditLedgerService.addPurchasedCredits(userId, 10, "stripe_session_1", "idemp_add_1");

    // Balance is now 1 free + 10 purchased = 11 total
    const initial = await CreditLedgerService.getBalance(userId);
    expect(initial.freeCredits).toBe(1);
    expect(initial.purchasedCredits).toBe(10);

    // Deduct 2 credits (e.g. Decision Spread)
    const result = await CreditLedgerService.deductCredits(userId, 2, "READING_DEDUCT", "idemp_deduct_1");
    expect(result.success).toBe(true);
    expect(result.deductedFromFree).toBe(1); // Consumed all free
    expect(result.deductedFromPurchased).toBe(1); // Consumed 1 purchased
    expect(result.remainingTotal).toBe(9);

    const after = await CreditLedgerService.getBalance(userId);
    expect(after.freeCredits).toBe(0);
    expect(after.purchasedCredits).toBe(9);
    expect(after.totalCredits).toBe(9);
  });

  it("rejects deduction when user has insufficient credits", async () => {
    const userId = "user_test_3";
    // User only has 1 free credit, tries to spend 3 credits
    const result = await CreditLedgerService.deductCredits(userId, 3, "READING_DEDUCT");
    expect(result.success).toBe(false);
    expect(result.remainingTotal).toBe(1);
  });

  it("prevents double-spending using idempotency key", async () => {
    const userId = "user_test_4";
    await CreditLedgerService.addPurchasedCredits(userId, 5, "stripe_sess_2", "idemp_add_2");

    // First deduction
    const first = await CreditLedgerService.deductCredits(userId, 2, "READING_DEDUCT", "idemp_key_unique_123");
    expect(first.success).toBe(true);
    expect(first.idempotentReplay).toBeUndefined();

    // Replay of same transaction
    const second = await CreditLedgerService.deductCredits(userId, 2, "READING_DEDUCT", "idemp_key_unique_123");
    expect(second.success).toBe(true);
    expect(second.idempotentReplay).toBe(true);

    const balance = await CreditLedgerService.getBalance(userId);
    // Was 6 total, only 2 deducted, remaining is 4
    expect(balance.totalCredits).toBe(4);
  });

  it("prevents duplicate Stripe webhook credit addition with duplicate event ID", async () => {
    const userId = "user_test_5";
    const webhookEventId = "evt_stripe_charge_100";

    const firstAdd = await CreditLedgerService.addPurchasedCredits(userId, 30, "sess_123", webhookEventId);
    expect(firstAdd.success).toBe(true);
    expect(firstAdd.alreadyProcessed).toBe(false);
    expect(firstAdd.newTotal).toBe(31); // 1 free + 30 purchased

    // Stripe webhook retry
    const retryAdd = await CreditLedgerService.addPurchasedCredits(userId, 30, "sess_123", webhookEventId);
    expect(retryAdd.success).toBe(true);
    expect(retryAdd.alreadyProcessed).toBe(true);
    expect(retryAdd.newTotal).toBe(31); // Not 61!
  });

  it("handles daily claim streak and rejects duplicate claim within same cycle", async () => {
    const userId = "user_test_6";

    const claim1 = await CreditLedgerService.claimDailyCredit(userId);
    expect(claim1.success).toBe(true);
    expect(claim1.streak).toBe(1);
    expect(claim1.totalCredits).toBe(2);

    // Immediate second claim should be rejected
    const claim2 = await CreditLedgerService.claimDailyCredit(userId);
    expect(claim2.success).toBe(false);
    expect(claim2.totalCredits).toBe(2);
  });
});
