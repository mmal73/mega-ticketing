import { describe, it, expect } from 'vitest';
import { PaymentStrategy } from './PaymentStrategy';
import { WalletBalanceStrategy, CreditCardStrategy } from './Implementations';

class PaymentProcessor {
  constructor(private strategy: PaymentStrategy) {}

  async executePayment(amount: number, userId: string) {
    return await this.strategy.pay(amount, userId);
  }
}

describe('PaymentStrategy (OCP)', () => {
  it('should process payment using Internal Wallet Balance', async () => {
    const walletStrategy = new WalletBalanceStrategy();
    const processor = new PaymentProcessor(walletStrategy);

    const result = await processor.executePayment(100, 'user-123');

    expect(result.success).toBe(true);
    expect(result.transactionId).toContain('txn_wallet_');
  });

  it('should process payment using Credit Card Gateway', async () => {
    const creditCardStrategy = new CreditCardStrategy();
    const processor = new PaymentProcessor(creditCardStrategy);

    const result = await processor.executePayment(250, 'user-456');

    expect(result.success).toBe(true);
    expect(result.transactionId).toContain('txn_cc_');
  });
});