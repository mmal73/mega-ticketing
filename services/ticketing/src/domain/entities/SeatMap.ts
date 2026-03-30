import { Seat } from './Seat';

export class SeatMap {
  private readonly _seats: Map<string, Seat> = new Map();

  constructor(public readonly eventId: string) {}

  public addSeat(seat: Seat): void {
    if (seat.eventId !== this.eventId) {
      throw new Error(`Seat ${seat.id} does not belong to Event ${this.eventId}.`);
    }
    if (this._seats.has(seat.id)) {
      throw new Error(`Seat ${seat.id} already exists in this map.`);
    }
    this._seats.set(seat.id, seat);
  }

  public getAvailableSeats(): Seat[] {
    return Array.from(this._seats.values()).filter(seat => seat.status === 'available');
  }

  public findSeatById(seatId: string): Seat {
    const seat = this._seats.get(seatId);
    if (!seat) {
      throw new Error(`Seat ${seatId} not found in this map.`);
    }
    return seat;
  }
}