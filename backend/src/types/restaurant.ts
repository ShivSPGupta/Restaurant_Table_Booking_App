export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  city: string;
  openingTime: string;
  closingTime: string;
  eventSpaceCategories?: string[];
  createdAt: string;
};

export type RestaurantRecord = Restaurant & {
  passwordHash: string;
};

export type RegisterRestaurantRequest = {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  city?: string;
  openingTime?: string;
  closingTime?: string;
};

export type RestaurantRepository = {
  findByEmail: (
    email: string
  ) =>
    | Promise<RestaurantRecord | null | undefined>
    | RestaurantRecord
    | null
    | undefined;
  findPublic: (
    city?: string
  ) => Promise<Restaurant[]> | Restaurant[];
  create: (
    restaurant: RestaurantRecord
  ) => Promise<RestaurantRecord> | RestaurantRecord;
  updateAvailability: (
    restaurantId: string,
    updates: Pick<Restaurant, "openingTime" | "closingTime">
  ) => Promise<RestaurantRecord | null | undefined> | RestaurantRecord | null | undefined;
};
