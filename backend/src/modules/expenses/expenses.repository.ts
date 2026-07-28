import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const expensesRepository = {

  findAll() {
    return prisma.expense.findMany({
      include: {
        category: true,
        supplier: true,
        invoice: true
      },
      orderBy: {
        date: "desc"
      }
    });
  },

  create(data: any) {
    return prisma.expense.create({
      data,
      include: {
        category: true,
        supplier: true
      }
    });
  },

  findForSummary() {
    return prisma.expense.findMany({
      include: {
        category: true
      }
    });
  }

};