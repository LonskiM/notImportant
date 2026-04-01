import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, (req: AuthRequest, res) => {
    res.json({ user: req.user });
});

export default router;