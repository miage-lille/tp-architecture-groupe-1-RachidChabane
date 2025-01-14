// src/webinars/exceptions/no-seats-available.ts
export class NoSeatsAvailableException extends Error {
  constructor() {
    super('No seats available for this webinar');
    this.name = 'NoSeatsAvailableException';
  }
}
