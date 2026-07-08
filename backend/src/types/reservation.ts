import type { TableCategory } from "./table";

export type Reservation = {
  id: string;
  restaurantId: string;
  userId?: string | null;
  tableId?: string | null;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  createdAt: string;
};

export type ReservationRequest = {
  restaurantId?: string;
  tableId?: string;
  tableCategory?: TableCategory | "ANY";
  date?: string;
  time?: string;
  guests?: string | number;
  name?: string;
  contact?: string;
};

export type AvailabilityRequest = {
  date?: string;
  time?: string;
  guests?: string | number;
  tableCategory?: TableCategory | "ANY";
};

export type AvailabilityResponse = {
  available: boolean;
  slots: string[];
  tables: {
    id: string;
    name: string;
    category: TableCategory;
    capacity: number;
  }[];
};

export type ReservationRepository = {
  findAll: () => Promise<Reservation[]> | Reservation[];
  findByRestaurantId: (
    restaurantId: string
  ) => Promise<Reservation[]> | Reservation[];
  findByUserId: (userId: string) => Promise<Reservation[]> | Reservation[];
  findByDateTime: (
    restaurantId: string,
    date: string,
    time: string
  ) => Promise<Reservation | null | undefined> | Reservation | null | undefined;
  findByTableDateTime: (
    tableId: string,
    date: string,
    time: string
  ) => Promise<Reservation | null | undefined> | Reservation | null | undefined;
  create: (reservation: Reservation) => Promise<Reservation> | Reservation;
  update: (
    restaurantId: string,
    reservationId: string,
    updates: Partial<Pick<Reservation, "tableId" | "date" | "time" | "guests" | "name" | "contact">>
  ) => Promise<Reservation | null | undefined> | Reservation | null | undefined;
  delete: (
    restaurantId: string,
    reservationId: string
  ) => Promise<boolean> | boolean;
};
