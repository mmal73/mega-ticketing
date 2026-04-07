import { describe, it, expect } from 'vitest';
import { SeatMap } from './SeatMap';
import { Seat } from './Seat';
import { SeatId } from '../value-objects/SeatId';

describe('SeatMap Entity (Clean Code Naming)', () => {
  it('should add a seat and retrieve it by ID', () => {
    const seatMap = new SeatMap('event-1');
    const seatId = SeatId.create('seat-1');
    const seat = new Seat(seatId, 'event-1', 'A', 1);
    
    seatMap.addSeat(seat);
    const foundSeat = seatMap.findSeatById('seat-1');
    
    expect(foundSeat.id.value).toBe('seat-1');
  });

  it('should return only available seats', () => {
    const seatMap = new SeatMap('event-1');
    const seatId1 = SeatId.create('seat-1');
    const seatId2 = SeatId.create('seat-2');
    const seat1 = new Seat(seatId1, 'event-1', 'A', 1);
    const seat2 = new Seat(seatId2, 'event-1', 'A', 2);
    
    seat1.lock();
    
    seatMap.addSeat(seat1);
    seatMap.addSeat(seat2);
    
    const availableSeats = seatMap.getAvailableSeats();
    
    expect(availableSeats.length).toBe(1);
    expect(availableSeats[0].id.value).toBe('seat-2');
  });

  it('should throw an error when adding a seat from a different event', () => {
    const seatMap = new SeatMap('event-1');
    const seatId = SeatId.create('seat-99');
    const invalidSeat = new Seat(seatId, 'event-99', 'Z', 99);
    
    expect(() => seatMap.addSeat(invalidSeat)).toThrow(
      'Seat seat-99 does not belong to Event event-1.'
    );
  });
});