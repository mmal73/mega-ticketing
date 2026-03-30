export class Venue {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string,
    public readonly totalCapacity: number,
  ) {
    if (totalCapacity <= 0) {
      throw new Error('A venue must have a total capacity greater than zero.');
    }
  }
}