/**
 * Custom error type for authenticated/authorized requests that carries an HTTP status.
 */
export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isHttpError(err: unknown): err is HttpError {
  return err instanceof HttpError;
}