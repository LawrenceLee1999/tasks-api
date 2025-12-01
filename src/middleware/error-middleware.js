import { AppError } from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message:
      statusCode === 500
        ? "Server error"
        : err.message || "Something went wrong",
  });
};
