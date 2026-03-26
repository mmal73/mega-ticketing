export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
}

/**
 * Interfaz base para cualquier método de pago.
 */
export interface PaymentStrategy {
  pay(amount: number, userId: string): Promise<PaymentResult>;
}