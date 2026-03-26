import { Wallet } from '../entities/Wallet';

export interface WalletRepository {
  findById(id: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<void>;
}