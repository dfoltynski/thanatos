export class InfraError extends Error {
  readonly status: unknown;

  constructor(
    message: string,
    options?: {
      status: number;
    },
  ) {
    super(message);
    this.status = options?.status;
  }
}
