import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { registerSchema, loginSchema } from "../validation/schemas";
import { logger } from "../utils/logger";

const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }
    return secret;
};

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// REGISTER
export const register = async (req: Request, res: Response) => {
    try {
        const parsed = registerSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid register payload" });
        }
        const { name, email, password } = parsed.data;

        // проверка
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // создаем/используем роль STUDENT, чтобы не зависеть от фиксированного id
        const studentRole = await prisma.role.upsert({
            where: { name: "STUDENT" },
            update: {},
            create: { name: "STUDENT" },
        });

        const user = await prisma.user.create({
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                passwordHash: hashedPassword,
                roleId: studentRole.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                roleId: true,
                createdAt: true,
            },
        });

        res.status(201).json(user);
    } catch (error) {
        logger.error({ error }, "Error registering user");
        res.status(500).json({ message: "Error registering user" });
    }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
    try {
        const parsed = loginSchema.safeParse(req.body ?? {});
        if (!parsed.success) {
            return res.status(400).json({ message: "Invalid login payload" });
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user.id, roleId: user.roleId },
            getJwtSecret(),
            { expiresIn: "1d" }
        );

        res.json({ token });
    } catch (error) {
        logger.error({ error }, "Error logging in");
        res.status(500).json({ message: "Error logging in" });
    }
};