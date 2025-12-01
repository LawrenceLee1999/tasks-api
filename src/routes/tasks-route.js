import express from "express";
import { auth } from "../middleware/auth-middleware.js";
import {
  createTask,
  allTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/tasks-controller.js";
const router = express.Router();

router.post("/", auth, createTask);
router.get("/", auth, allTasks);
router.get("/:id", auth, getTaskById);
router.put("/:id", auth, updateTask);
router.delete("/:id", auth, deleteTask);

export default router;
