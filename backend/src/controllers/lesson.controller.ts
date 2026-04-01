import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createLessonSchema } from "../validation/schemas";
import { logger } from "../utils/logger";

// GET /courses/:id/lessons
export const getLessonsByCourse = async (req: Request, res: Response) => {
    try {
        const courseId = Number(req.params.id);
        if (!Number.isInteger(courseId) || courseId <= 0) {
            return res.status(400).json({ message: "Invalid course id" });
        }

        const lessons = await prisma.lesson.findMany({
            where: { courseId },
            orderBy: { orderIndex: "asc" },
        });

        res.json(lessons);
    } catch (error) {
        logger.error({ error }, "Error fetching lessons");
        res.status(500).json({ message: "Error fetching lessons" });
    }
};

// GET /lessons/:id
export const getLessonById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid lesson id" });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id },
        });

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        res.json(lesson);
    } catch (error) {
        logger.error({ error }, "Error fetching lesson");
        res.status(500).json({ message: "Error fetching lesson" });
    }
};

// POST /lessons
export const createLesson = async (req: AuthRequest, res: Response) => {
    try {
        const parsed = createLessonSchema.safeParse({
            ...req.body,
            courseId: Number(req.body?.courseId),
            orderIndex: Number(req.body?.orderIndex),
        });
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid lesson payload" });
        }
        const { title, content, courseId, orderIndex } = parsed.data;
        const user = req.user!;

        // только TEACHER и ADMIN
        if (![1, 2].includes(user.roleId)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (user.roleId === 2) {
            const course = await prisma.course.findUnique({
                where: { id: courseId },
                select: { authorId: true },
            });

            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }

            if (course.authorId !== user.userId) {
                return res.status(403).json({ message: "Forbidden for this course" });
            }
        }

        const lesson = await prisma.lesson.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                courseId,
                orderIndex,
            },
        });

        res.json(lesson);
    } catch (error) {
        logger.error({ error }, "Error creating lesson");
        res.status(500).json({ message: "Error creating lesson" });
    }
};