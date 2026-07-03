export type Reservation = {
  id: string;
  restaurantId: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  createdAt: string;
};

export type ReservationRequest = {
  date?: string;
  time?: string;
  guests?: string | number;
  name?: string;
  contact?: string;
};

export type AvailabilityRequest = {
  date?: string;
  time?: string;
};

export type AvailabilityResponse = {
  available: boolean;
  slots: string[];
};

export type ReservationRepository = {
  findAll: () => Promise<Reservation[]> | Reservation[];
  findByDateTime: (
    restaurantId: string,
    date: string,
    time: string
  ) => Promise<Reservation | null | undefined> | Reservation | null | undefined;
  create: (reservation: Reservation) => Promise<Reservation> | Reservation;
};
