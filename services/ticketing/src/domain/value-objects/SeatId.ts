import { DomainError } from '../errors/DomainError';

export class InvalidSeatIdError extends DomainError {
  constructor() {
    super('Seat ID cannot be empty or consist only of whitespace.');
  }
}

export class SeatId {
  private constructor(public readonly value: string) {}

  public static create(value: string): SeatId {
    if (!value || value.trim().length === 0) {
      throw new InvalidSeatIdError();
    }
    return new SeatId(value.trim());
  }

  public equals(other: SeatId): boolean {
    if (!other) {
      return false;
    }
    return this.value === other.value;
  }
}