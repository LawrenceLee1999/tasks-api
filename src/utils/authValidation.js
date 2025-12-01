import { AppError } from "./AppError.js";

const emailRegex = /^\S+@\S+\.\S+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export function validateEmailAndPassword(email, password) {
  if (!email || !password) {
    throw new AppError("Required field is missing", 400);
  }

  if (!emailRegex.test(email)) {
    throw new AppError(
      "Invalid email address. Email must have at least an '@' and '.'",
      400
    );
  }

  if (!passwordRegex.test(password)) {
    throw new AppError(
      "Invalid password. Password must have a minimum of 8 characters, at least 1 letter and 1 number",
      400
    );
  }
}