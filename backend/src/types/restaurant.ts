export type Restaurant = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
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
};

export type LoginRestaurantRequest = {
  email?: string;
  password?: string;
};

export type AuthResponse = {
  token: string;
  restaurant: Restaurant;
};

export type RestaurantRepository = {
  findByEmail: (
    email: string
  ) =>
    | Promise<RestaurantRecord | null | undefined>
    | RestaurantRecord
    | null
    | undefined;
  create: (
    restaurant: RestaurantRecord
  ) => Promise<RestaurantRecord> | RestaurantRecord;
};
