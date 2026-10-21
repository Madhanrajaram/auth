import express from "express";
import {
  currentUserController,
  logoutController,
  userController,
} from "../controller/userController.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/v1", userController);
router.get("/me", requireAuth, currentUserController);
router.post("/logout", logoutController);

export default router;
