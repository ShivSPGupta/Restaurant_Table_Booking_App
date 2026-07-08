import prisma from "../lib/prisma";
import type { RestaurantTable, TableCategory, TableRepository } from "../types/table";

type PrismaTable = {
  id: string;
  restaurantId: string;
  name: string;
  normalizedName?: string | null;
  category?: string | null;
  capacity: number;
  isActive: boolean;
  createdAt: Date;
};

function mapTable(table: PrismaTable): RestaurantTable {
  return {
    id: table.id,
    restaurantId: table.restaurantId,
    name: table.name,
    category: (table.category || "PUBLIC") as TableCategory,
    capacity: table.capacity,
    isActive: table.isActive,
    createdAt: table.createdAt.toISOString(),
  };
}

function normalizeTableName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
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
        normalizedName: normalizeTableName(table.name),
        category: table.category,
        capacity: table.capacity,
        isActive: table.isActive,
        createdAt: new Date(table.createdAt),
      } as any,
    });

    return mapTable(createdTable);
  }

  async function update(
    restaurantId: string,
    tableId: string,
    updates: Partial<Pick<RestaurantTable, "name" | "category" | "capacity" | "isActive">>
  ): Promise<RestaurantTable | null> {
    const existingTable = await prisma.table.findFirst({
      where: { id: tableId, restaurantId },
    });

    if (!existingTable) {
      return null;
    }

    const updatedTable = await prisma.table.update({
      where: { id: tableId },
      data: {
        ...updates,
        ...(updates.name !== undefined
          ? { normalizedName: normalizeTableName(updates.name) }
          : {}),
      } as any,
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
