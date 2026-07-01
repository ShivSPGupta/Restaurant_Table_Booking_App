export type Reservation = {
  id: string;
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
  findAll: () => Reservation[];
  findByDateTime: (date: string, time: string) => Reservation | undefined;
  create: (reservation: Reservation) => Reservation;
};
