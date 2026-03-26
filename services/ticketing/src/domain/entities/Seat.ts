export type SeatStatus = 'available' | 'locked' | 'reserved';

export class Seat {
  constructor(
    public readonly id: string,
    public readonly eventId: string,
    public readonly row: string,
    public readonly seatNumber: number,
    private _status: SeatStatus = 'available',
  ) {}

  get status(): SeatStatus {
    return this._status;
  }

  /**
   * Bloquea el asiento temporalmente (ej. cuando el usuario lo selecciona para pagar)
   */
  public lock(): void {
    if (this._status !== 'available') {
      throw new Error(`Cannot lock seat ${this.id} because it is currently ${this._status}.`);
    }
    this._status = 'locked';
  }

  /**
   * Confirma la reserva del asiento una vez que el pago fue exitoso
   */
  public reserve(): void {
    if (this._status !== 'locked') {
      throw new Error(`Cannot reserve seat ${this.id}. It must be locked first.`);
    }
    this._status = 'reserved';
  }

  /**
   * Libera el asiento (ej. si el pago falló o el lock expiró)
   */
  public release(): void {
    this._status = 'available';
  }
}