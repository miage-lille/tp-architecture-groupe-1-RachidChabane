export class AlreadyParticipatingException extends Error {
  constructor() {
    super('User is already participating in this webinar');
    this.name = 'AlreadyParticipatingException';
  }
}
