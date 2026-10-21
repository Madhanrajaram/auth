import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dbConnect } from "./src/config/db.js";
import userRouter from "./src/routes/userRouter.js";

const backendDir = dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: resolve(backendDir, "src/.env"),
});

const app = express();
const PORT = Number(process.env.PORT || 5001);

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(express.json());
app.use("/login", userRouter);

const startServer = async () => {
  await dbConnect();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`server is running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error);
  process.exitCode = 1;
});
