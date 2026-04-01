import { Router } from "express";
import { getTestById, submitTest } from "../controllers/test.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/tests/:id", getTestById);
router.post("/tests/:id/submit", authMiddleware, submitTest);

export default router;