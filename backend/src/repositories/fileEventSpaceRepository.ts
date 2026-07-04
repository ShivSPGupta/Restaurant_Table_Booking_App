import fs from "fs";
import path from "path";
import type { EventSpace, EventSpaceRepository } from "../types/eventSpace";

function createFileEventSpaceRepository(dataDir: string): EventSpaceRepository {
  const spacesFile = path.join(dataDir, "eventSpaces.json");

  function ensureStorage(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(spacesFile)) {
      fs.writeFileSync(spacesFile, "[]", "utf8");
    }
  }

  function findAll(): EventSpace[] {
    ensureStorage();

    try {
      const spaces = JSON.parse(fs.readFileSync(spacesFile, "utf8"));
      return Array.isArray(spaces) ? spaces : [];
    } catch {
      return [];
    }
  }

  function saveAll(spaces: EventSpace[]): void {
    ensureStorage();
    fs.writeFileSync(spacesFile, JSON.stringify(spaces, null, 2), "utf8");
  }

  function findByRestaurantId(restaurantId: string): EventSpace[] {
    return findAll().filter((space) => space.restaurantId === restaurantId);
  }

  function create(space: EventSpace): EventSpace {
    const spaces = findAll();
    spaces.push(space);
    saveAll(spaces);
    return space;
  }

  return {
    findByRestaurantId,
    create,
  };
}

export default createFileEventSpaceRepository;
