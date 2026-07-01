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

  function checkAvailability({
    date,
    time,
  }: AvailabilityRequest): AvailabilityResponse {
    if (!date || !time) {
      throw new AppError("Date and time are required.", 400);
    }

    const reservation = reservationRepository.findByDateTime(date, time);

    return {
      available: !reservation,
      slots: reservation ? [] : [time],
    };
  }

  function createReservation(payload: ReservationRequest): Reservation {
    const { date, time, guests, name, contact } = payload;
    assertRequiredFields({ date, time, guests, name, contact });

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    const existingReservation = reservationRepository.findByDateTime(
      date as string,
      time as string
    );
    if (existingReservation) {
      throw new AppError("This time slot is already booked.", 409);
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
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
