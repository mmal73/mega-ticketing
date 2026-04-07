import { InvalidSeatStatusError } from '../errors/TicketingErrors';
import { SeatId } from '../value-objects/SeatId';

export type SeatStatus = 'available' | 'locked' | 'reserved';

export class Seat {
  constructor(
    public readonly id: SeatId,
    public readonly eventId: string,
    public readonly row: string,
    public readonly seatNumber: number,
    private _status: SeatStatus = 'available',
  ) {}

  get status(): SeatStatus {
    return this._status;
  }

  public lock(): void {
    if (this._status !== 'available') {
      throw new InvalidSeatStatusError(this.id.value, this._status, 'lock');
    }
    this._status = 'locked';
  }

  public reserve(): void {
    if (this._status !== 'locked') {
      throw new InvalidSeatStatusError(this.id.value, this._status, 'reserve');
    }
    this._status = 'reserved';
  }

  public release(): void {
    this._status = 'available';
  }
}