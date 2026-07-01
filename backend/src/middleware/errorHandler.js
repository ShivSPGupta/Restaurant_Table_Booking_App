function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Something went wrong. Please try again." : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
