import fs from "fs";
import path from "path";
import type { Reservation, ReservationRepository } from "../types/reservation";

function withReservationDefaults(reservation: Reservation): Reservation {
  return {
    ...reservation,
    eventSpaceId: reservation.eventSpaceId || null,
    bookingType: reservation.bookingType || "TABLE",
    endTime: reservation.endTime || null,
  };
}

function createFileReservationRepository(dataDir: string): ReservationRepository {
  const reservationsFile = path.join(dataDir, "reservations.json");

  function ensureStorage(): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(reservationsFile)) {
      fs.writeFileSync(reservationsFile, "[]", "utf8");
    }
  }

  function findAll(): Reservation[] {
    ensureStorage();

    try {
      const fileContents = fs.readFileSync(reservationsFile, "utf8");
      const reservations = JSON.parse(fileContents);
      return Array.isArray(reservations)
        ? reservations.map(withReservationDefaults)
        : [];
    } catch (error) {
      return [];
    }
  }

  function saveAll(reservations: Reservation[]): void {
    ensureStorage();
    fs.writeFileSync(
      reservationsFile,
      JSON.stringify(reservations, null, 2),
      "utf8"
    );
  }

  function findByDateTime(
    restaurantId: string,
    date: string,
    time: string
  ): Reservation | undefined {
    return findAll().find(
      (reservation) =>
        reservation.restaurantId === restaurantId &&
        reservation.date === date &&
        reservation.time === time
    );
  }

  function findByTableDateTime(
    tableId: string,
    date: string,
    time: string
  ): Reservation | undefined {
    return findAll().find(
      (reservation) =>
        reservation.tableId === tableId &&
        reservation.date === date &&
        reservation.time === time
    );
  }

  function findByEventSpaceDateTime(
    eventSpaceId: string,
    date: string,
    time: string
  ): Reservation | undefined {
    return findAll().find(
      (reservation) =>
        reservation.eventSpaceId === eventSpaceId &&
        reservation.date === date &&
        reservation.time === time
    );
  }

  function findByEventSpaceDate(
    eventSpaceId: string,
    date: string
  ): Reservation[] {
    return findAll().filter(
      (reservation) =>
        reservation.eventSpaceId === eventSpaceId && reservation.date === date
    );
  }

  function findByRestaurantId(restaurantId: string): Reservation[] {
    return findAll().filter(
      (reservation) => reservation.restaurantId === restaurantId
    );
  }

  function findByUserId(userId: string): Reservation[] {
    return findAll().filter((reservation) => reservation.userId === userId);
  }

  function create(reservation: Reservation): Reservation {
    const reservations = findAll();
    reservations.push(reservation);
    saveAll(reservations);
    return reservation;
  }

  function update(
    restaurantId: string,
    reservationId: string,
    updates: Partial<Pick<Reservation, "tableId" | "date" | "time" | "guests" | "name" | "contact">>
  ): Reservation | null {
    const reservations = findAll();
    const reservationIndex = reservations.findIndex(
      (reservation) =>
        reservation.id === reservationId &&
        reservation.restaurantId === restaurantId
    );

    if (reservationIndex === -1) {
      return null;
    }

    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      ...updates,
    };
    saveAll(reservations);
    return reservations[reservationIndex];
  }

  function deleteReservation(
    restaurantId: string,
    reservationId: string
  ): boolean {
    const reservations = findAll();
    const nextReservations = reservations.filter(
      (reservation) =>
        reservation.id !== reservationId ||
        reservation.restaurantId !== restaurantId
    );

    if (nextReservations.length === reservations.length) {
      return false;
    }

    saveAll(nextReservations);
    return true;
  }

  return {
    findAll,
    findByRestaurantId,
    findByUserId,
    findByDateTime,
    findByTableDateTime,
    findByEventSpaceDateTime,
    findByEventSpaceDate,
    create,
    update,
    delete: deleteReservation,
  };
}

export default createFileReservationRepository;
