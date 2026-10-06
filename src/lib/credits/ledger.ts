export interface LedgerBalance {
  freeCredits: number;
  purchasedCredits: number;
  totalCredits: number;
  dailyStreak: number;
  canClaimDaily: boolean;
  lastClaimDate?: string;
}

export interface DeductionResult {
  success: boolean;
  deductedFromFree: number;
  deductedFromPurchased: number;
  remainingTotal: number;
  idempotentReplay?: boolean;
}

export interface ClaimResult {
  success: boolean;
  streak: number;
  totalCredits: number;
  message: string;
}

// In-Memory store for fast, reliable testing & serverless fallback
const memoryLedgers = new Map<
  string,
  {
    freeCredits: number;
    purchasedCredits: number;
    dailyStreak: number;
    lastClaimTimestamp: number;
  }
>();

const memoryTransactions = new Map<
  string,
  {
    userId: string;
    amount: number;
    type: string;
    idempotencyKey: string;
    createdAt: string;
  }
>();

function getOrInitMemoryLedger(userId: string) {
  if (!memoryLedgers.has(userId)) {
    memoryLedgers.set(userId, {
      freeCredits: 1, // 1 free credit welcome bonus
      purchasedCredits: 0,
      dailyStreak: 0,
      lastClaimTimestamp: 0,
    });
  }
  return memoryLedgers.get(userId)!;
}

export class CreditLedgerService {
  /**
   * Retrieves the current credit balance and streak status
   */
  static async getBalance(userId: string): Promise<LedgerBalance> {
    const ledger = getOrInitMemoryLedger(userId);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Check if 24 hours have passed since last daily claim
    const canClaimDaily = now - ledger.lastClaimTimestamp >= oneDayMs || ledger.lastClaimTimestamp === 0;

    return {
      freeCredits: ledger.freeCredits,
      purchasedCredits: ledger.purchasedCredits,
      totalCredits: ledger.freeCredits + ledger.purchasedCredits,
      dailyStreak: ledger.dailyStreak,
      canClaimDaily,
      lastClaimDate: ledger.lastClaimTimestamp ? new Date(ledger.lastClaimTimestamp).toISOString() : undefined,
    };
  }

  /**
   * Daily credit claim with consecutive day streak rewards
   */
  static async claimDailyCredit(userId: string): Promise<ClaimResult> {
    const ledger = getOrInitMemoryLedger(userId);
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const timeSinceLastClaim = now - ledger.lastClaimTimestamp;

    if (ledger.lastClaimTimestamp > 0 && timeSinceLastClaim < oneDayMs) {
      return {
        success: false,
        streak: ledger.dailyStreak,
        totalCredits: ledger.freeCredits + ledger.purchasedCredits,
        message: "Daily credit already claimed for this cycle",
      };
    }

    // Streak logic: if claimed within 48h, streak continues; otherwise resets to 1
    if (ledger.lastClaimTimestamp > 0 && timeSinceLastClaim <= 48 * 60 * 60 * 1000) {
      ledger.dailyStreak += 1;
    } else {
      ledger.dailyStreak = 1;
    }

    ledger.freeCredits += 1;
    ledger.lastClaimTimestamp = now;

    return {
      success: true,
      streak: ledger.dailyStreak,
      totalCredits: ledger.freeCredits + ledger.purchasedCredits,
      message: `Daily credit claimed! Streak is now ${ledger.dailyStreak} days.`,
    };
  }

  /**
   * Atomically deducts credits prioritizing free credits over purchased credits
   * Includes idempotencyKey deduplication
   */
  static async deductCredits(
    userId: string,
    cost: number,
    actionType: string,
    idempotencyKey?: string
  ): Promise<DeductionResult> {
    if (cost < 0) {
      throw new Error("Deduction cost cannot be negative");
    }

    // Check idempotency replay
    if (idempotencyKey && memoryTransactions.has(idempotencyKey)) {
      const existing = memoryTransactions.get(idempotencyKey)!;
      const ledger = getOrInitMemoryLedger(userId);
      return {
        success: true,
        deductedFromFree: 0,
        deductedFromPurchased: 0,
        remainingTotal: ledger.freeCredits + ledger.purchasedCredits,
        idempotentReplay: true,
      };
    }

    const ledger = getOrInitMemoryLedger(userId);
    const totalAvailable = ledger.freeCredits + ledger.purchasedCredits;

    if (totalAvailable < cost) {
      return {
        success: false,
        deductedFromFree: 0,
        deductedFromPurchased: 0,
        remainingTotal: totalAvailable,
      };
    }

    // Prioritize deducting from free credits first
    let fromFree = Math.min(ledger.freeCredits, cost);
    let fromPurchased = cost - fromFree;

    ledger.freeCredits -= fromFree;
    ledger.purchasedCredits -= fromPurchased;

    if (idempotencyKey) {
      memoryTransactions.set(idempotencyKey, {
        userId,
        amount: -cost,
        type: actionType,
        idempotencyKey,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      success: true,
      deductedFromFree: fromFree,
      deductedFromPurchased: fromPurchased,
      remainingTotal: ledger.freeCredits + ledger.purchasedCredits,
    };
  }

  /**
   * Adds purchased credits (from Stripe checkout) idempotently
   */
  static async addPurchasedCredits(
    userId: string,
    amount: number,
    referenceId: string,
    idempotencyKey: string
  ): Promise<{ success: boolean; newTotal: number; alreadyProcessed?: boolean }> {
    if (memoryTransactions.has(idempotencyKey)) {
      const ledger = getOrInitMemoryLedger(userId);
      return {
        success: true,
        newTotal: ledger.freeCredits + ledger.purchasedCredits,
        alreadyProcessed: true,
      };
    }

    const ledger = getOrInitMemoryLedger(userId);
    ledger.purchasedCredits += amount;

    memoryTransactions.set(idempotencyKey, {
      userId,
      amount,
      type: "PURCHASE",
      idempotencyKey,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      newTotal: ledger.freeCredits + ledger.purchasedCredits,
      alreadyProcessed: false,
    };
  }

  /**
   * Reset store (used for unit testing)
   */
  static _resetMemoryStore() {
    memoryLedgers.clear();
    memoryTransactions.clear();
  }
}
