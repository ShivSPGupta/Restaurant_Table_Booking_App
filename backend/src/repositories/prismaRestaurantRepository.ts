import prisma from "../lib/prisma";
import type {
  RestaurantRecord,
  RestaurantRepository,
} from "../types/restaurant";

type PrismaRestaurant = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string;
  openingTime: string;
  closingTime: string;
  passwordHash: string;
  createdAt: Date;
};

function mapRestaurant(restaurant: PrismaRestaurant): RestaurantRecord {
  return {
    ...restaurant,
    createdAt: restaurant.createdAt.toISOString(),
  };
}

function createPrismaRestaurantRepository(): RestaurantRepository {
  async function findByEmail(
    email: string
  ): Promise<RestaurantRecord | null> {
    const restaurant = await prisma.restaurant.findUnique({
      where: { email },
    });

    return restaurant ? mapRestaurant(restaurant) : null;
  }

  async function findPublic(city?: string) {
    const restaurants = await prisma.restaurant.findMany({
      where: city
        ? {
            city: {
              equals: city,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: { name: "asc" },
    });

    return restaurants.map((restaurant) => {
      const { passwordHash, ...publicRestaurant } = mapRestaurant(restaurant);
      return publicRestaurant;
    });
  }

  async function create(
    restaurant: RestaurantRecord
  ): Promise<RestaurantRecord> {
    const createdRestaurant = await prisma.restaurant.create({
      data: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        phone: restaurant.phone,
        address: restaurant.address,
        city: restaurant.city,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime,
        passwordHash: restaurant.passwordHash,
        createdAt: new Date(restaurant.createdAt),
      },
    });

    return mapRestaurant(createdRestaurant);
  }

  async function updateAvailability(
    restaurantId: string,
    updates: Pick<RestaurantRecord, "openingTime" | "closingTime">
  ): Promise<RestaurantRecord | null> {
    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: updates,
    });

    return restaurant ? mapRestaurant(restaurant) : null;
  }

  return {
    findByEmail,
    findPublic,
    create,
    updateAvailability,
  };
}

export default createPrismaRestaurantRepository;
