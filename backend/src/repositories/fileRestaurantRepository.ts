import fs from "fs";
import path from "path";
import type {
  RestaurantRecord,
  RestaurantRepository,
} from "../types/restaurant";

function createFileRestaurantRepository(dataDir: string): RestaurantRepository {
  const restaurantsFile = path.join(dataDir, "restaurants.json");

  function ensureStorage(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(restaurantsFile)) {
      fs.writeFileSync(restaurantsFile, "[]", "utf8");
    }
  }

  function findAll(): RestaurantRecord[] {
    ensureStorage();

    try {
      const fileContents = fs.readFileSync(restaurantsFile, "utf8");
      const restaurants = JSON.parse(fileContents);
      return Array.isArray(restaurants) ? restaurants : [];
    } catch {
      return [];
    }
  }

  function saveAll(restaurants: RestaurantRecord[]): void {
    ensureStorage();
    fs.writeFileSync(
      restaurantsFile,
      JSON.stringify(restaurants, null, 2),
      "utf8"
    );
  }

  function findByEmail(email: string): RestaurantRecord | undefined {
    return findAll().find((restaurant) => restaurant.email === email);
  }

  function create(restaurant: RestaurantRecord): RestaurantRecord {
    const restaurants = findAll();
    restaurants.push(restaurant);
    saveAll(restaurants);
    return restaurant;
  }

  function updateAvailability(
    restaurantId: string,
    updates: Pick<RestaurantRecord, "openingTime" | "closingTime">
  ): RestaurantRecord | null {
    const restaurants = findAll();
    const restaurantIndex = restaurants.findIndex(
      (restaurant) => restaurant.id === restaurantId
    );

    if (restaurantIndex === -1) {
      return null;
    }

    restaurants[restaurantIndex] = {
      ...restaurants[restaurantIndex],
      ...updates,
    };
    saveAll(restaurants);
    return restaurants[restaurantIndex];
  }

  return {
    findByEmail,
    create,
    updateAvailability,
  };
}

export default createFileRestaurantRepository;
