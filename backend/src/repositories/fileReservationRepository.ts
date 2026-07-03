import fs from "fs";
import path from "path";
import type { Reservation, ReservationRepository } from "../types/reservation";

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
      return Array.isArray(reservations) ? reservations : [];
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

  function create(reservation: Reservation): Reservation {
    const reservations = findAll();
    reservations.push(reservation);
    saveAll(reservations);
    return reservation;
  }

  return {
    findAll,
    findByDateTime,
    create,
  };
}

export default createFileReservationRepository;
