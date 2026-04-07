import { DomainError } from './DomainError.js';

export class InvalidSeatStatusError extends DomainError {
  constructor(seatId: string, currentStatus: string, action: string) {
    super(`Cannot ${action} seat ${seatId} because its current status is ${currentStatus}.`);
  }
}

export class SeatNotFoundError extends DomainError {
  constructor(seatId: string) {
    super(`Seat ${seatId} not found.`);
  }
}

export class EventMismatchError extends DomainError {
  constructor(seatId: string, expectedEventId: string) {
    super(`Seat ${seatId} does not belong to Event ${expectedEventId}.`);
  }
}

export class SeatAlreadyExistsError extends DomainError {
  constructor(seatId: string) {
    super(`Seat ${seatId} already exists in this map.`);
  }
}

export class InvalidEventStatusError extends DomainError {
  constructor(eventId: string, currentStatus: string, action: string) {
    super(`Event ${eventId} cannot be ${action}. Current status is ${currentStatus}.`);
  }
}