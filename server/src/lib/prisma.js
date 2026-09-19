import { PrismaClient } from "@prisma/client";

// Single shared instance so we don't exhaust SQLite connections across
// hot reloads / multiple route modules.
export const prisma = new PrismaClient();
