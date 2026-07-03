import type { ErrorRequestHandler } from "express";

function getPrismaErrorMessage(error: unknown): string | null {
  if (
    typeof error === "object" &&
    error !== null &&
    "clientVersion" in error &&
    "code" in error
  ) {
    return "Database request failed. Check Supabase connection variables and run `npm run db:push` after schema changes.";
  }

  return null;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const prismaMessage = statusCode === 500 ? getPrismaErrorMessage(error) : null;
  const message =
    statusCode === 500
      ? prismaMessage || "Something went wrong. Please try again."
      : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
