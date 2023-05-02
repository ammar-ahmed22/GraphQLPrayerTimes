import type { GraphQLFormattedError } from "graphql";
import { ArgumentValidationError } from "type-graphql";
import { unwrapResolverError } from "@apollo/server/errors";
import { ValidationError } from "./ValidationError";

export function myFormatError(
  formattedError: GraphQLFormattedError,
  error: unknown
): GraphQLFormattedError {
  const originalError = unwrapResolverError(error);

  // Validation
  if (originalError instanceof ArgumentValidationError) {
    console.log("validation error");
    return new ValidationError(originalError.validationErrors);
  }

  // Generic
  return formattedError;
}
