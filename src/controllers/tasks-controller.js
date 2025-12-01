import pool from "../config/db.js";
import {
  validateRequiredTitle,
  validateOptionalTitle,
  validateOptionalStatus,
  validateStatusFilter,
  validateOptionalDescription,
} from "../utils/taskValidation.js";
import { getOwnedTaskOrThrow } from "../utils/taskHelpers.js";

export const createTask = async (req, res, next) => {
  const { title, description, status } = req.body;
  const userId = Number(req.user.id);

  try {
    const trimmedTitle = validateRequiredTitle(title);
    const validatedStatus = validateOptionalStatus(status);
    const finalStatus = validatedStatus || "todo";
    const finalDescription = validateOptionalDescription(description);

    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, trimmedTitle, finalDescription, finalStatus]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const allTasks = async (req, res, next) => {
  const userId = Number(req.user.id);
  const { status, sort, order, page = 1, limit = 10 } = req.query;

  try {
    const statusFilter = validateStatusFilter(status);

    let sortColumn = "created_at";
    if (sort === "createdAt") sortColumn = "created_at";
    if (sort === "updatedAt") sortColumn = "updated_at";

    let sortDirection = "DESC";
    if (order && typeof order === "string") {
      const lower = order.toLowerCase();
      if (lower === "asc" || lower === "desc") {
        sortDirection = lower.toUpperCase();
      }
    }

    let pageNumber = Number(page);
    let limitNumber = Number(limit);

    if (!pageNumber) pageNumber = 1;
    if (!limitNumber) limitNumber = 10;

    if (pageNumber < 1) pageNumber = 1;
    if (limitNumber < 1) limitNumber = 1;

    const offset = (pageNumber - 1) * limitNumber;

    const whereParts = ["user_id = $1"];
    const values = [userId];

    if (statusFilter) {
      values.push(statusFilter);
      whereParts.push(`status = $${values.length}`);
    }

    const whereClause = "WHERE " + whereParts.join(" AND ");

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM tasks
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    values.push(limitNumber, offset);
    const dataQuery = `
      SELECT *
      FROM tasks
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    const dataResult = await pool.query(dataQuery, values);

    return res.status(200).json({
      data: dataResult.rows,
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = Number(req.user.id);

  try {
    const task = await getOwnedTaskOrThrow(taskId, userId);
    return res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = Number(req.user.id);
  const { title, description, status } = req.body;

  try {
    await getOwnedTaskOrThrow(taskId, userId);

    const finalTitle = validateOptionalTitle(title);
    const finalDescription = validateOptionalDescription(description);
    const finalStatus = validateOptionalStatus(status);

    const result = await pool.query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         description = COALESCE($2, description),
         status = COALESCE($3, status),
         updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [finalTitle, finalDescription, finalStatus, taskId, userId]
    );

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  const taskId = req.params.id;
  const userId = Number(req.user.id);

  try {
    await getOwnedTaskOrThrow(taskId, userId);

    await pool.query(`DELETE FROM tasks WHERE id = $1 AND user_id = $2`, [
      taskId,
      userId,
    ]);

    return res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
