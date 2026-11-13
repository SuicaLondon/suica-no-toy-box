/** Why a model call failed, in one line for the page and the logs. */
import {
  APICallError,
  NoObjectGeneratedError,
  NoOutputGeneratedError,
  RetryError,
} from "ai";

/**
 * The error's message, plus the start of the provider's reply when it sent
 * one. After retries, the last attempt's error explains the failure.
 */
export function describeError(error: unknown): string {
  const cause = RetryError.isInstance(error) ? error.lastError : error;
  const message = cause instanceof Error ? cause.message : String(cause);
  if (APICallError.isInstance(cause) && cause.responseBody) {
    return `${message}: ${cause.responseBody.slice(0, 500)}`;
  }
  return message;
}

/**
 * Says what happened when a model gave no usable output: it declined, or it
 * gave no answer. Any other error passes through unchanged.
 */
export function noOutputError(error: unknown, model: string): unknown {
  if (NoObjectGeneratedError.isInstance(error)) {
    const declined = error.finishReason === "content-filter";
    return new Error(
      declined ? `${model} declined the request` : `${model} gave no answer`,
      { cause: error },
    );
  }
  if (NoOutputGeneratedError.isInstance(error)) {
    return new Error(`${model} gave no answer`, { cause: error });
  }
  return error;
}
