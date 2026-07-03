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
        passwordHash: restaurant.passwordHash,
        createdAt: new Date(restaurant.createdAt),
      },
    });

    return mapRestaurant(createdRestaurant);
  }

  return {
    findByEmail,
    create,
  };
}

export default createPrismaRestaurantRepository;
