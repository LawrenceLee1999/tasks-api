import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";
import { validateEmailAndPassword } from "../utils/authValidation.js";

function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };

  const secret = process.env.JWT_SECRET;

  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    validateEmailAndPassword(email, password);

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (existing.rows.length > 0) {
      throw new AppError("Email already in use", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword]
    );

    const user = result.rows[0];

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      throw new AppError("Required field is missing", 400);
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      throw new AppError("Invalid credentials", 404);
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user);
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
