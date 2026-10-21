import express from "express";
import { userController } from "../controller/userController.js";

const router = express.Router();

router.post("/v1", userController);

export default router;
