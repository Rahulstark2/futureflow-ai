import { prisma } from "../db/client";

export interface CreateProcessDTO {
  name: string;
  industry: string;
  description: string;
}

export const processRepository = {
  async findAll() {
    return prisma.process.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.process.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { sequence: "asc" } },
        problems: true,
        opportunities: true,
        futureActivities: { orderBy: { sequence: "asc" } },
        benefits: true,
      },
    });
  },

  async create(data: CreateProcessDTO) {
    return prisma.process.create({
      data,
    });
  },

  async update(id: string, data: Partial<CreateProcessDTO>) {
    return prisma.process.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.process.delete({
      where: { id },
    });
  },
};
