export class Wallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    private _balance: number = 0,
  ) {}

  get balance(): number {
    return this._balance;
  }

}