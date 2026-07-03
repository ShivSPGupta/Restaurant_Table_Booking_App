import crypto from "crypto";
import AppError from "../errors/AppError";
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  Reservation,
  ReservationRepository,
  ReservationRequest,
} from "../types/reservation";

function createReservationService(reservationRepository: ReservationRepository) {
  function assertRequiredFields(fields: Record<string, unknown>): void {
    const missingField = Object.entries(fields).find(([, value]) => !value);

    if (missingField) {
      throw new AppError("All fields are required.", 400);
    }
  }

  async function checkAvailability({
    restaurantId,
    date,
    time,
  }: AvailabilityRequest & { restaurantId: string }): Promise<AvailabilityResponse> {
    if (!date || !time) {
      throw new AppError("Date and time are required.", 400);
    }

    const reservation = await reservationRepository.findByDateTime(
      restaurantId,
      date,
      time
    );

    return {
      available: !reservation,
      slots: reservation ? [] : [time],
    };
  }

  async function createReservation(
    payload: ReservationRequest & { restaurantId: string }
  ): Promise<Reservation> {
    const { restaurantId, date, time, guests, name, contact } = payload;
    assertRequiredFields({ date, time, guests, name, contact });

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    const existingReservation = await reservationRepository.findByDateTime(
      restaurantId,
      date as string,
      time as string
    );
    if (existingReservation) {
      throw new AppError("This time slot is already booked.", 409);
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      restaurantId,
      date: date as string,
      time: time as string,
      guests: parsedGuests,
      name: (name as string).trim(),
      contact: (contact as string).trim(),
      createdAt: new Date().toISOString(),
    };

    return reservationRepository.create(reservation);
  }

  return {
    checkAvailability,
    createReservation,
  };
}

export default createReservationService;
