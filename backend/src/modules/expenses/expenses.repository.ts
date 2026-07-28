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
  },

  update(id: string, data: any) {
    return prisma.expense.update({
      where: { id },
      data,
      include: { category: true, supplier: true }
    });
  },

  delete(id: string) {
    return prisma.expense.delete({ where: { id } });
  }

};