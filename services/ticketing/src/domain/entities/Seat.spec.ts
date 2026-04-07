import { describe, it, expect } from 'vitest';
import { Seat } from './Seat';
import { InvalidSeatStatusError } from '../errors/TicketingErrors';
import { SeatId } from '../value-objects/SeatId';

describe('Seat Entity', () => {
  it('should create an available seat by default', () => {
    const seatId = SeatId.create('seat-1');
    const seat = new Seat(seatId, 'event-1', 'A', 1);
    
    expect(seat.id.value).toBe('seat-1');
    expect(seat.status).toBe('available');
  });

  it('should lock an available seat successfully', () => {
    const seatId = SeatId.create('seat-2');
    const seat = new Seat(seatId, 'event-1', 'B', 5);
    
    seat.lock();
    
    expect(seat.status).toBe('locked');
  });

  it('should throw an error if trying to lock an already locked seat', () => {
    const seatId = SeatId.create('seat-3');
    const seat = new Seat(seatId, 'event-1', 'C', 10);
    seat.lock();
    
    expect(() => seat.lock()).toThrow(InvalidSeatStatusError);
  });

  it('should reserve a locked seat', () => {
    const seatId = SeatId.create('seat-4');
    const seat = new Seat(seatId, 'event-1', 'D', 2);
    seat.lock();
    seat.reserve();
    
    expect(seat.status).toBe('reserved');
  });

  it('should throw an error if trying to reserve an available seat directly', () => {
    const seatId = SeatId.create('seat-5');
    const seat = new Seat(seatId, 'event-1', 'E', 4);
    
    expect(() => seat.reserve()).toThrow(InvalidSeatStatusError);
  });

  it('should release a seat back to available', () => {
    const seatId = SeatId.create('seat-6');
    const seat = new Seat(seatId, 'event-1', 'F', 1);
    seat.lock();
    seat.release();
    
    expect(seat.status).toBe('available');
  });
});