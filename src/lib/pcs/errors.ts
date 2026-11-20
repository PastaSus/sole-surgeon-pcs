export type PcsErrorCode =
  | "NOT_FOUND"
  | "ALREADY_STARTED"
  | "TASK_LOCKED"
  | "TASK_ALREADY_DONE"
  | "INVALID_REQUEST";

export class PcsError extends Error {
  readonly status: number;
  readonly code: PcsErrorCode;

  constructor(code: PcsErrorCode, message: string, status: number) {
    super(message);
    this.name = "PcsError";
    this.code = code;
    this.status = status;
  }
}

export class AirtableConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AirtableConfigError";
  }
}

export class AirtableRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AirtableRequestError";
    this.status = status;
  }
}
