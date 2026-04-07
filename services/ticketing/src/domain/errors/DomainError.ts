const ErrorWithCapture = Error as typeof Error & {
  captureStackTrace?(target: object, constructorOpt?: Function): void;
};

export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    ErrorWithCapture.captureStackTrace?.(this, this.constructor);
  }
}