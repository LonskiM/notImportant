import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { createCourseSchema } from "../validation/schemas";
import { logger } from "../utils/logger";

// GET /courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await prisma.course.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            }
        });

        res.json(courses);
    } catch (error) {
        logger.error({ error }, "Error fetching courses");
        res.status(500).json({ message: "Error fetching courses" });
    }
};

// GET /courses/:id
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid course id" });
        }

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                lessons: true,
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.json(course);
    } catch (error) {
        logger.error({ error }, "Error fetching course");
        res.status(500).json({ message: "Error fetching course" });
    }
};

// POST /courses
export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const parsed = createCourseSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid course payload" });
        }
        const { title, description } = parsed.data;

        const course = await prisma.course.create({
            data: {
                title: title.trim(),
                description: description.trim(),
                authorId: req.user!.userId,
            },
        });

        res.json(course);
    } catch (error) {
        logger.error({ error }, "Error creating course");
        res.status(500).json({ message: "Error creating course" });
    }
};