// Thrown by controllers/services for expected failure cases (not found,
// forbidden, bad request) so the central error handler can respond with
// the right status instead of a generic 500.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
