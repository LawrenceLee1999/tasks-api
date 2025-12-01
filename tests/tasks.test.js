import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";

let user1Token;
let user2Token;
let otherUserTaskId;

beforeAll(async () => {
  const user1 = { email: "user1@example.com", password: "Password123" };
  const user2 = { email: "user2@example.com", password: "Password123" };

  await request(app).post("/auth/register").send(user1);
  await request(app).post("/auth/register").send(user2);

  const login1 = await request(app).post("/auth/login").send(user1);
  expect(login1.statusCode).toBe(200);
  expect(login1.body).toHaveProperty("token");
  user1Token = login1.body.token;

  const login2 = await request(app).post("/auth/login").send(user2);
  expect(login2.statusCode).toBe(200);
  expect(login2.body).toHaveProperty("token");
  user2Token = login2.body.token;
});

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;");
});

afterAll(async () => {
  await pool.end();
});

describe("Tasks API - validation on create", () => {
  test("should reject creating a task with no title", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title is required");
  });

  test("should reject creating a task when title is not a string", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: 1234 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title must be a string");
  });

  test("should reject creating a task with short title", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        title: "hi",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title must be at least 3 characters long");
  });

  test("should reject creating a task with a long title", async () => {
    const longTitle = "x".repeat(101);
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: longTitle });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Title must be less than 100 characters");
  });

  test("should create a task", async () => {
    const res = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({
        title: "Test task",
        description: "A simple test",
        status: "todo",
      });

    expect(res.statusCode).toBe(201);
    expect(typeof res.body).toBe("object");

    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("number");

    expect(res.body.title).toBe("Test task");
    expect(res.body.status).toBe("todo");

    expect(res.body.user_id).toBeDefined();
    expect(typeof res.body.user_id).toBe("number");

    expect(res.body).toHaveProperty("created_at");
    expect(res.body).toHaveProperty("updated_at");
  });
});

describe("Tasks API - list / filter / pagination", () => {
  test("should list tasks for the authenticated user", async () => {
    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Task A", status: "todo" });

    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Task B", status: "done" });

    const res = await request(app)
      .get("/tasks")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body).toHaveProperty("pagination");

    const ids = res.body.data.map((t) => t.id);
    expect(ids).not.toContain(otherUserTaskId);
  });

  test("should filter tasks by status", async () => {
    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Todo task", status: "todo" });

    await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Done task", status: "done" });

    const res = await request(app)
      .get("/tasks?status=done")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((task) => {
      expect(task.status).toBe("done");
    });
  });

  test("should support pagination", async () => {
    for (let i = 0; i < 3; i++) {
      await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${user1Token}`)
        .send({ title: `Page task ${i}`, status: "todo" });
    }

    const res = await request(app)
      .get("/tasks?page=1&limit=2")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("pagination");
    expect(res.body.data.length).toBeLessThanOrEqual(2);
  });
});

describe("Tasks API - get single task", () => {
  test("should get a task by id", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Single task test" });

    const taskId = createRes.body.id;

    const res = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(taskId);
    expect(res.body.title).toBe("Single task test");
  });

  test("should return 404 for non-existent task", async () => {
    const res = await request(app)
      .get("/tasks/99999999")
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Task not found");
  });
});

describe("Tasks API - update task", () => {
  test("should update a task", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "To be updated", status: "todo" });

    const taskId = createRes.body.id;

    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "Updated title", status: "in-progress" });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated title");
    expect(res.body.status).toBe("in-progress");
  });
});

describe("Tasks API - delete task", () => {
  test("should delete a task", async () => {
    const createRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user1Token}`)
      .send({ title: "To be deleted" });

    const taskId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body.message).toBe("Task deleted successfully");

    const getRes = await request(app)
      .get(`/tasks/${taskId}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(getRes.statusCode).toBe(404);
  });
});

describe("Tasks API - auth / permissions", () => {
  test("should return 401 when no token is provided", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  test("should return 401 for invalid token", async () => {
    const res = await request(app)
      .get("/tasks")
      .set("Authorization", "Bearer invalid.token.here");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  test("should return 403 when accessing another user's task", async () => {
    const otherTaskRes = await request(app)
      .post("/tasks")
      .set("Authorization", `Bearer ${user2Token}`)
      .send({ title: "Other user's task" });

    expect(otherTaskRes.statusCode).toBe(201);
    otherUserTaskId = otherTaskRes.body.id;

    const res = await request(app)
      .get(`/tasks/${otherUserTaskId}`)
      .set("Authorization", `Bearer ${user1Token}`);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Not authorised to access this task");
  });
});
