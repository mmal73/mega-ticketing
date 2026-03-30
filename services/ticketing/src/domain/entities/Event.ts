export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export class Event {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly venueId: string,
    public readonly scheduledDate: Date,
    private _status: EventStatus = 'draft',
  ) {}

  get status(): EventStatus {
    return this._status;
  }

  public publish(): void {
    if (this._status !== 'draft') {
      throw new Error(`Event ${this.id} cannot be published. Current status is ${this._status}.`);
    }
    this._status = 'published';
  }

  public cancel(): void {
    if (this._status === 'completed') {
      throw new Error(`Event ${this.id} is already completed and cannot be cancelled.`);
    }
    this._status = 'cancelled';
  }
}