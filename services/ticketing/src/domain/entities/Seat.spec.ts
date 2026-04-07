import { describe, it, expect } from 'vitest';
import { Seat } from './Seat';
import { InvalidSeatStatusError } from '../errors/TicketingErrors.js';

describe('Seat Entity', () => {
  it('should create an available seat by default', () => {
    const seat = new Seat('seat-1', 'event-1', 'A', 1);
    
    expect(seat.id).toBe('seat-1');
    expect(seat.status).toBe('available');
  });

  it('should lock an available seat successfully', () => {
    const seat = new Seat('seat-2', 'event-1', 'B', 5);
    
    seat.lock();
    
    expect(seat.status).toBe('locked');
  });

  it('should throw an error if trying to lock an already locked seat', () => {
    const seat = new Seat('seat-3', 'event-1', 'C', 10);
    seat.lock();
    
    expect(() => seat.lock()).toThrow(InvalidSeatStatusError);
  });

  it('should reserve a locked seat', () => {
    const seat = new Seat('seat-4', 'event-1', 'D', 2);
    seat.lock();
    seat.reserve();
    
    expect(seat.status).toBe('reserved');
  });

  it('should throw an error if trying to reserve an available seat directly', () => {
    const seat = new Seat('seat-5', 'event-1', 'E', 4);
    
    // Intenta reservar sin bloquearlo primero
    expect(() => seat.reserve()).toThrow(InvalidSeatStatusError);
  });

  it('should release a seat back to available', () => {
    const seat = new Seat('seat-6', 'event-1', 'F', 1);
    seat.lock();
    seat.release();
    
    expect(seat.status).toBe('available');
  });
});