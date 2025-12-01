import pool from "../config/db.js";
import { AppError } from "./AppError.js";

export async function getOwnedTaskOrThrow(taskId, userId) {
  const result = await pool.query(
    `SELECT * FROM tasks WHERE id = $1`,
    [taskId]
  );

  if (result.rows.length === 0) {
    throw new AppError("Task not found", 404);
  }

  const task = result.rows[0];

  if (task.user_id !== userId) {
    throw new AppError("Not authorised to access this task", 403);
  }

  return task;
}