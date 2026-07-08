import prisma from "../lib/prisma";
import type { EventSpace, EventSpaceRepository } from "../types/eventSpace";

type PrismaEventSpace = {
  id: string;
  restaurantId: string;
  name: string;
  occasion: string;
  category?: string | null;
  capacity: number;
  price: number | null;
  isActive: boolean;
  createdAt: Date;
};

function mapEventSpace(space: PrismaEventSpace): EventSpace {
  return {
    ...space,
    category: (space.category || "GENERAL_EVENT") as EventSpace["category"],
    createdAt: space.createdAt.toISOString(),
  };
}

function createPrismaEventSpaceRepository(): EventSpaceRepository {
  async function findByRestaurantId(restaurantId: string): Promise<EventSpace[]> {
    const spaces = await prisma.eventSpace.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    return spaces.map(mapEventSpace);
  }

  async function create(space: EventSpace): Promise<EventSpace> {
    const createdSpace = await prisma.eventSpace.create({
      data: {
        id: space.id,
        restaurantId: space.restaurantId,
        name: space.name,
        occasion: space.occasion,
        category: space.category,
        capacity: space.capacity,
        price: space.price,
        isActive: space.isActive,
        createdAt: new Date(space.createdAt),
      },
    });

    return mapEventSpace(createdSpace);
  }

  return {
    findByRestaurantId,
    create,
  };
}

export default createPrismaEventSpaceRepository;
