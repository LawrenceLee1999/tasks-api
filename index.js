import express from "express";
import authRoutes from "./src/routes/auth-route.js";
import taskRoutes from "./src/routes/tasks-route.js";
import { notFound, errorHandler } from "./src/middleware/error-middleware.js";

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
