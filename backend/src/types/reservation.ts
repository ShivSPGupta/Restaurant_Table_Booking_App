import type { TableCategory } from "./table";
import type { EventSpaceCategory } from "./eventSpace";

export type BookingType = "TABLE" | "EVENT_SPACE";

export type Reservation = {
  id: string;
  restaurantId: string;
  userId?: string | null;
  tableId?: string | null;
  eventSpaceId?: string | null;
  bookingType: BookingType;
  date: string;
  time: string;
  endTime?: string | null;
  guests: number;
  name: string;
  contact: string;
  createdAt: string;
};

export type ReservationRequest = {
  restaurantId?: string;
  tableId?: string;
  eventSpaceId?: string;
  bookingType?: BookingType;
  tableCategory?: TableCategory | "ANY";
  eventSpaceCategory?: EventSpaceCategory | "ANY";
  date?: string;
  time?: string;
  endTime?: string;
  guests?: string | number;
  name?: string;
  contact?: string;
};

export type AvailabilityRequest = {
  date?: string;
  time?: string;
  endTime?: string;
  guests?: string | number;
  tableCategory?: TableCategory | "ANY";
  bookingType?: BookingType;
  eventSpaceCategory?: EventSpaceCategory | "ANY";
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
  eventSpaces: {
    id: string;
    name: string;
    category: EventSpaceCategory;
    capacity: number;
    price?: number | null;
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
  findByEventSpaceDateTime: (
    eventSpaceId: string,
    date: string,
    time: string
  ) => Promise<Reservation | null | undefined> | Reservation | null | undefined;
  findByEventSpaceDate: (
    eventSpaceId: string,
    date: string
  ) => Promise<Reservation[]> | Reservation[];
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
