import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authRepository = {

    testConnection() {
        return prisma.$queryRaw`SELECT 1`;
    },

    findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    },

    findByRole(role: string) {
        return prisma.user.findFirst({
            where: { role: role as any }
        });
    },

    getUsers() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    },

    createUser(data: any) {
        return prisma.user.create({
            data
        });
    },

    createAuditLog(data: any) {
        return prisma.auditLog.create({
            data
        });
    },

    userCount() {
        return prisma.user.count();
    }
};