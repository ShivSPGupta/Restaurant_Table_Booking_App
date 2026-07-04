import fs from "fs";
import path from "path";
import type { RestaurantTable, TableRepository } from "../types/table";

function createFileTableRepository(dataDir: string): TableRepository {
  const tablesFile = path.join(dataDir, "tables.json");

  function ensureStorage(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(tablesFile)) {
      fs.writeFileSync(tablesFile, "[]", "utf8");
    }
  }

  function findAll(): RestaurantTable[] {
    ensureStorage();

    try {
      const tables = JSON.parse(fs.readFileSync(tablesFile, "utf8"));
      return Array.isArray(tables) ? tables : [];
    } catch {
      return [];
    }
  }

  function saveAll(tables: RestaurantTable[]): void {
    ensureStorage();
    fs.writeFileSync(tablesFile, JSON.stringify(tables, null, 2), "utf8");
  }

  function findByRestaurantId(restaurantId: string): RestaurantTable[] {
    return findAll().filter((table) => table.restaurantId === restaurantId);
  }

  function create(table: RestaurantTable): RestaurantTable {
    const tables = findAll();
    tables.push(table);
    saveAll(tables);
    return table;
  }

  function update(
    restaurantId: string,
    tableId: string,
    updates: Partial<Pick<RestaurantTable, "name" | "capacity" | "isActive">>
  ): RestaurantTable | null {
    const tables = findAll();
    const tableIndex = tables.findIndex(
      (table) => table.id === tableId && table.restaurantId === restaurantId
    );

    if (tableIndex === -1) {
      return null;
    }

    tables[tableIndex] = {
      ...tables[tableIndex],
      ...updates,
    };
    saveAll(tables);
    return tables[tableIndex];
  }

  return {
    findByRestaurantId,
    create,
    update,
  };
}

export default createFileTableRepository;
