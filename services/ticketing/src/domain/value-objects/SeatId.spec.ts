import { describe, it, expect } from 'vitest';
import { SeatId, InvalidSeatIdError } from './SeatId';

describe('SeatId Value Object', () => {
  it('should create a valid SeatId', () => {
    const seatId = SeatId.create('seat-123');
    expect(seatId.value).toBe('seat-123');
  });

  it('should trim whitespace when creating', () => {
    const seatId = SeatId.create('  seat-456  ');
    expect(seatId.value).toBe('seat-456');
  });

  it('should throw an error if value is empty', () => {
    expect(() => SeatId.create('')).toThrow(InvalidSeatIdError);
    expect(() => SeatId.create('   ')).toThrow(InvalidSeatIdError);
  });

  it('should consider two instances with the same value as equal', () => {
    const id1 = SeatId.create('seat-789');
    const id2 = SeatId.create('seat-789');
    
    // Different objects in memory, but equal by value
    expect(id1.equals(id2)).toBe(true);
  });
});