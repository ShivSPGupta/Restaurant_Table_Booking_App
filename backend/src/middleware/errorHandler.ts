import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Something went wrong. Please try again." : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
};

export default errorHandler;
