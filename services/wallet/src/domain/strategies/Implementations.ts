import type { PaymentStrategy, PaymentResult } from './PaymentStrategy';

export class WalletBalanceStrategy implements PaymentStrategy {
  async pay(amount: number, userId: string): Promise<PaymentResult> {
    console.log(`[Wallet] Debiting $${amount} from user ${userId}'s internal wallet.`);
    return { success: true, transactionId: `txn_wallet_${Date.now()}` };
  }
}

export class CreditCardStrategy implements PaymentStrategy {
  async pay(amount: number, userId: string): Promise<PaymentResult> {
    console.log(`[Credit Card] Processing $${amount} for user ${userId} via external gateway.`);
    return { success: true, transactionId: `txn_cc_${Date.now()}` };
  }
}