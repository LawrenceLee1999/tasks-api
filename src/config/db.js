import pg from "pg";
import dotenv from "dotenv";

if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

if (process.env.NODE_ENV !== "test") {
  pool
    .connect()
    .then((client) => {
      console.log("Connected to PostgreSQL ✅");
      client.release();
    })
    .catch((err) => {
      console.error("Error connecting to PostgreSQL ❌", err);
    });
}

export default pool;
