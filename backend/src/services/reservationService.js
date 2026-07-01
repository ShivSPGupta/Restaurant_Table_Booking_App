const crypto = require("crypto");
const AppError = require("../errors/AppError");

function createReservationService(reservationRepository) {
  function assertRequiredFields(fields) {
    const missingField = Object.entries(fields).find(([, value]) => !value);

    if (missingField) {
      throw new AppError("All fields are required.", 400);
    }
  }

  function checkAvailability({ date, time }) {
    if (!date || !time) {
      throw new AppError("Date and time are required.", 400);
    }

    const reservation = reservationRepository.findByDateTime(date, time);

    return {
      available: !reservation,
      slots: reservation ? [] : [time],
    };
  }

  function createReservation(payload) {
    const { date, time, guests, name, contact } = payload;
    assertRequiredFields({ date, time, guests, name, contact });

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    const existingReservation = reservationRepository.findByDateTime(date, time);
    if (existingReservation) {
      throw new AppError("This time slot is already booked.", 409);
    }

    const reservation = {
      id: crypto.randomUUID(),
      date,
      time,
      guests: parsedGuests,
      name: name.trim(),
      contact: contact.trim(),
      createdAt: new Date().toISOString(),
    };

    return reservationRepository.create(reservation);
  }

  return {
    checkAvailability,
    createReservation,
  };
}

module.exports = createReservationService;
