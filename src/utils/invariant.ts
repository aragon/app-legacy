const INVARIANT_ERROR = 'Invariant';

export function invariant(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    const error = new Error(message);
    error.name = INVARIANT_ERROR;

    throw error;
  }

  return;
}
