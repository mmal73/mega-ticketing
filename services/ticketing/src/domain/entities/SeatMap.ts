import { Seat } from './Seat';
import { EventMismatchError, SeatAlreadyExistsError, SeatNotFoundError } from '../errors/TicketingErrors';

export class SeatMap {
  private readonly _seats: Map<string, Seat> = new Map();

  constructor(public readonly eventId: string) {}

  public addSeat(seat: Seat): void {
    if (seat.eventId !== this.eventId) {
      throw new EventMismatchError(seat.id.value, this.eventId);
    }
    if (this._seats.has(seat.id.value)) {
      throw new SeatAlreadyExistsError(seat.id.value);
    }
    this._seats.set(seat.id.value, seat);
  }

  public getAvailableSeats(): Seat[] {
    return Array.from(this._seats.values()).filter(seat => seat.status === 'available');
  }

  public findSeatById(seatId: string): Seat {
    const seat = this._seats.get(seatId);
    if (!seat) {
      throw new SeatNotFoundError(seatId);
    }
    return seat;
  }
}