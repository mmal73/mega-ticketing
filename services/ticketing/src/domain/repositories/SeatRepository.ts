import { Seat } from '../entities/Seat';

export interface SeatRepository {
  findById(id: string): Promise<Seat | null>;
  save(seat: Seat): Promise<void>;
}