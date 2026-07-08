export type EventSpaceCategory =
  | "MARRIAGE"
  | "BIRTHDAY_PARTY"
  | "RECEPTION"
  | "GENERAL_PARTY"
  | "GENERAL_EVENT";

export type EventSpace = {
  id: string;
  restaurantId: string;
  name: string;
  occasion: string;
  category: EventSpaceCategory;
  capacity: number;
  price?: number | null;
  isActive: boolean;
  createdAt: string;
};

export type EventSpaceRequest = {
  name?: string;
  occasion?: string;
  category?: EventSpaceCategory;
  capacity?: number | string;
  price?: number | string;
  isActive?: boolean;
};

export type EventSpaceRepository = {
  findByRestaurantId: (
    restaurantId: string
  ) => Promise<EventSpace[]> | EventSpace[];
  create: (space: EventSpace) => Promise<EventSpace> | EventSpace;
};
