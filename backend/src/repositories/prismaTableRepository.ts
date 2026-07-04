import prisma from "../lib/prisma";
import type { RestaurantTable, TableRepository } from "../types/table";

type PrismaTable = {
  id: string;
  restaurantId: string;
  name: string;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
};

function mapTable(table: PrismaTable): RestaurantTable {
  return {
    ...table,
    createdAt: table.createdAt.toISOString(),
  };
}

function createPrismaTableRepository(): TableRepository {
  async function findByRestaurantId(
    restaurantId: string
  ): Promise<RestaurantTable[]> {
    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    return tables.map(mapTable);
  }

  async function create(table: RestaurantTable): Promise<RestaurantTable> {
    const createdTable = await prisma.table.create({
      data: {
        id: table.id,
        restaurantId: table.restaurantId,
        name: table.name,
        capacity: table.capacity,
        isActive: table.isActive,
        createdAt: new Date(table.createdAt),
      },
    });

    return mapTable(createdTable);
  }

  async function update(
    restaurantId: string,
    tableId: string,
    updates: Partial<Pick<RestaurantTable, "name" | "capacity" | "isActive">>
  ): Promise<RestaurantTable | null> {
    const existingTable = await prisma.table.findFirst({
      where: { id: tableId, restaurantId },
    });

    if (!existingTable) {
      return null;
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: updates,
    });

    return mapTable(updatedTable);
  }

  return {
    findByRestaurantId,
    create,
    update,
  };
}

export default createPrismaTableRepository;
