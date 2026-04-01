import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const createCourseSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
});

export const createLessonSchema = z.object({
    title: z.string().min(3),
    content: z.string().min(1),
    courseId: z.number().int().positive(),
    orderIndex: z.number().int().nonnegative(),
});

export const completeLessonSchema = z.object({
    lessonId: z.number().int().positive(),
});

