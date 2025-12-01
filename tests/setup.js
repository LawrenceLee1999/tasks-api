import pool from "../src/config/db.js";

beforeEach(async () => {
  await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE;");
  await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE;");
});

afterAll(async () => {
  await pool.end();
});
