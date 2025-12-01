import { AppError } from "./AppError.js";

const allowedStatuses = ["todo", "in-progress", "done"];

export function validateRequiredTitle(title) {
  if (title === undefined) {
    throw new AppError("Title is required", 400);
  }
  if (typeof title !== "string") {
    throw new AppError("Title must be a string", 400);
  }

  const trimmed = title.trim();

  if (trimmed.length < 3) {
    throw new AppError("Title must be at least 3 characters long", 400);
  }

  if (trimmed.length > 100) {
    throw new AppError("Title must be less than 100 characters", 400);
  }

  return trimmed;
}

export function validateOptionalTitle(title) {
  if (title === undefined) return null;

  if (typeof title !== "string") {
    throw new AppError("Title must be a string", 400);
  }

  const trimmed = title.trim();

  if (trimmed.length < 3) {
    throw new AppError("Title must be at least 3 characters long", 400);
  }

  if (trimmed.length > 100) {
    throw new AppError("Title must be less than 100 characters", 400);
  }

  return trimmed;
}

export function validateOptionalStatus(status) {
  if (status === undefined) return null;

  if (typeof status !== "string") {
    throw new AppError("Status must be a string", 400);
  }

  const trimmed = status.trim();

  if (trimmed.length === 0) {
    throw new AppError("Status cannot be empty", 400);
  }

  if (!allowedStatuses.includes(trimmed)) {
    throw new AppError("Invalid status value", 400);
  }

  return trimmed;
}

export function validateStatusFilter(status) {
  if (status === undefined) return null;

  if (typeof status !== "string") {
    throw new AppError("Status must be a string", 400);
  }

  const trimmed = status.trim();

  if (!allowedStatuses.includes(trimmed)) {
    throw new AppError("Invalid status filter", 400);
  }

  return trimmed;
}

export function validateOptionalDescription(description) {
  if (description === undefined) {
    return null;
  }

  if (typeof description !== "string") {
    throw new AppError("Description must be a string", 400);
  }

  return description;
}
