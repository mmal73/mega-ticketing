import { describe, it, expect } from 'vitest';
import { SeatMap } from './SeatMap';
import { Seat } from './Seat';

describe('SeatMap Entity (Clean Code Naming)', () => {
  it('should add a seat and retrieve it by ID', () => {
    const seatMap = new SeatMap('event-1');
    const seat = new Seat('seat-1', 'event-1', 'A', 1);
    
    seatMap.addSeat(seat);
    const foundSeat = seatMap.findSeatById('seat-1');
    
    expect(foundSeat.id).toBe('seat-1');
  });

  it('should return only available seats', () => {
    const seatMap = new SeatMap('event-1');
    const seat1 = new Seat('seat-1', 'event-1', 'A', 1);
    const seat2 = new Seat('seat-2', 'event-1', 'A', 2);
    
    seat1.lock(); // Not available anymore
    
    seatMap.addSeat(seat1);
    seatMap.addSeat(seat2);
    
    const availableSeats = seatMap.getAvailableSeats();
    
    expect(availableSeats.length).toBe(1);
    expect(availableSeats[0].id).toBe('seat-2');
  });

  it('should throw an error when adding a seat from a different event', () => {
    const seatMap = new SeatMap('event-1');
    const invalidSeat = new Seat('seat-99', 'event-99', 'Z', 99);
    
    expect(() => seatMap.addSeat(invalidSeat)).toThrow(
      'Seat seat-99 does not belong to Event event-1.'
    );
  });
});