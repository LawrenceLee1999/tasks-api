import request from "supertest";
import app from "../index.js";
import pool from "../src/config/db.js";

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;");
  await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
});

afterAll(async () => {
  await pool.end();
});

describe("Auth API - /auth/register", () => {
  test("should register a user successfully", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "test@example.com",
      password: "Password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("id");
    expect(res.body.user).toHaveProperty("email", "test@example.com");
  });

  test("should reject when email or password is missing", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Required field is missing");
  });

  test("should reject invalid email format", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "not-an-email",
      password: "Password123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Invalid email address. Email must have at least an '@' and '.'"
    );
  });

  test("should reject weak password", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "user@example.com",
      password: "weak",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe(
      "Invalid password. Password must have a minimum of 8 characters, at least 1 letter and 1 number"
    );
  });

  test("should reject duplicate email", async () => {
    const payload = {
      email: "duplicate@example.com",
      password: "Password123",
    };

    const first = await request(app).post("/auth/register").send(payload);
    expect(first.statusCode).toBe(201);

    const second = await request(app).post("/auth/register").send(payload);
    expect(second.statusCode).toBe(400);
    expect(second.body.message).toBe("Email already in use");
  });
});

describe("Auth API - /auth/login", () => {
  test("should login successfully with correct credentials", async () => {
    const email = "loginuser@example.com";
    const password = "Password123";

    const registerRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(registerRes.statusCode).toBe(201);

    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email, password });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("token");
    expect(typeof loginRes.body.token).toBe("string");
  });

  test("should reject login when fields are missing", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "", password: "" });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Required field is missing");
  });

  test("should reject login with non-existent email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "does-not-exist@example.com",
      password: "Password123",
    });

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Invalid credentials");
  });

  test("should reject login with wrong password", async () => {
    const email = "wrongpass@example.com";
    const password = "Password123";

    const registerRes = await request(app)
      .post("/auth/register")
      .send({ email, password });

    expect(registerRes.statusCode).toBe(201);

    const loginRes = await request(app).post("/auth/login").send({
      email,
      password: "WrongPassword999",
    });

    expect(loginRes.statusCode).toBe(401);
    expect(loginRes.body.message).toBe("Invalid credentials");
  });
});
