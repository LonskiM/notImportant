import { Router } from "express";
import {
    getCourses,
    getCourseById,
    createCourse,
} from "../controllers/course.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {requireRole} from "../middleware/role.middleware";

const router = Router();

router.get("/", getCourses);
router.get("/:id", getCourseById);
router.post(
    "/",
    authMiddleware,
    requireRole([1, 2]), // ADMIN и TEACHER
    createCourse
);

export default router;