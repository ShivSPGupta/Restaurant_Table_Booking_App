import type { Restaurant } from "./restaurant";
import type { User } from "./user";

export type AuthRole = "restaurant" | "user";

export type LoginRequest = {
  email?: string;
  password?: string;
};

export type AuthAccount =
  | {
      role: "restaurant";
      restaurant: Restaurant;
    }
  | {
      role: "user";
      user: User;
    };

export type AuthResponse = AuthAccount & {
  token: string;
};
