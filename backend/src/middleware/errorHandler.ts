import type { ErrorRequestHandler } from "express";
import { getPrismaErrorMessage } from "../lib/prismaError";

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
