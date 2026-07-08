import crypto from "crypto";
import AppError from "../errors/AppError";
import type {
  AvailabilityRequest,
  AvailabilityResponse,
  Reservation,
  ReservationRepository,
  ReservationRequest,
} from "../types/reservation";
import type { RestaurantTable, TableRepository } from "../types/table";
import type { TableCategory } from "../types/table";

const tableCategories = ["PUBLIC", "COUPLE", "FAMILY", "SPECIAL"] as const;

function normalizeTableCategory(
  category?: TableCategory | "ANY"
): TableCategory | "ANY" {
  if (!category || category === "ANY") {
    return "ANY";
  }

  if (!tableCategories.includes(category)) {
    throw new AppError("Select a valid table category.", 400);
  }

  return category;
}

function createReservationService(
  reservationRepository: ReservationRepository,
  tableRepository: TableRepository
) {
  function isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function assertRequiredFields(fields: Record<string, unknown>): void {
    const missingField = Object.entries(fields).find(([, value]) => !value);

    if (missingField) {
      throw new AppError("All fields are required.", 400);
    }
  }

  async function updateUserReservation(
    userId: string,
    reservationId: string,
    payload: Partial<Pick<ReservationRequest, "date" | "time" | "guests" | "name" | "contact">>
  ): Promise<Reservation> {
    const userReservations = await reservationRepository.findByUserId(userId);
    const currentReservation = userReservations.find(
      (reservation) => reservation.id === reservationId
    );

    if (!currentReservation) {
      throw new AppError("Reservation not found.", 404);
    }

    const updates: Partial<Pick<Reservation, "date" | "time" | "guests" | "name" | "contact">> = {};

    if (payload.date !== undefined) {
      const date = payload.date.trim();
      if (!date) {
        throw new AppError("Reservation date is required.", 400);
      }
      updates.date = date;
    }

    if (payload.time !== undefined) {
      const time = payload.time.trim();
      if (!isValidTime(time)) {
        throw new AppError("Reservation time must use HH:mm format.", 400);
      }
      updates.time = time;
    }

    if (payload.guests !== undefined) {
      const guests = Number(payload.guests);
      if (!Number.isInteger(guests) || guests < 1) {
        throw new AppError("Guests must be a whole number greater than 0.", 400);
      }
      updates.guests = guests;
    }

    if (updates.guests !== undefined && currentReservation.tableId) {
      const tables = await tableRepository.findByRestaurantId(
        currentReservation.restaurantId
      );
      const selectedTable = tables.find(
        (table) => table.id === currentReservation.tableId
      );

      if (!selectedTable || selectedTable.capacity < updates.guests) {
        throw new AppError("Selected table does not have enough seats.", 400);
      }
    }

    if (payload.name !== undefined) {
      const name = payload.name.trim();
      if (!name) {
        throw new AppError("Guest name is required.", 400);
      }
      updates.name = name;
    }

    if (payload.contact !== undefined) {
      const contact = payload.contact.trim();
      if (!contact) {
        throw new AppError("Contact number is required.", 400);
      }
      updates.contact = contact;
    }

    const nextDate = updates.date || currentReservation.date;
    const nextTime = updates.time || currentReservation.time;

    if (
      currentReservation.tableId &&
      (nextDate !== currentReservation.date || nextTime !== currentReservation.time)
    ) {
      const duplicateReservation = await reservationRepository.findByTableDateTime(
        currentReservation.tableId,
        nextDate,
        nextTime
      );

      if (
        duplicateReservation &&
        duplicateReservation.id !== currentReservation.id
      ) {
        throw new AppError("This time slot is already booked.", 409);
      }
    }

    const reservation = await reservationRepository.update(
      currentReservation.restaurantId,
      reservationId,
      updates
    );

    if (!reservation) {
      throw new AppError("Reservation not found.", 404);
    }

    return reservation;
  }

  async function cancelUserReservation(
    userId: string,
    reservationId: string
  ): Promise<void> {
    const userReservations = await reservationRepository.findByUserId(userId);
    const currentReservation = userReservations.find(
      (reservation) => reservation.id === reservationId
    );

    if (!currentReservation) {
      throw new AppError("Reservation not found.", 404);
    }

    const wasDeleted = await reservationRepository.delete(
      currentReservation.restaurantId,
      reservationId
    );

    if (!wasDeleted) {
      throw new AppError("Reservation not found.", 404);
    }
  }

  async function getAvailableTables(
    restaurantId: string,
    date: string,
    time: string,
    guests: number,
    tableCategory: TableCategory | "ANY"
  ): Promise<RestaurantTable[]> {
    const tables = await tableRepository.findByRestaurantId(restaurantId);
    const activeTables = tables.filter(
      (table) =>
        table.isActive &&
        table.capacity >= guests &&
        (tableCategory === "ANY" || table.category === tableCategory)
    );
    const tableAvailability = await Promise.all(
      activeTables.map(async (table) => ({
        table,
        reservation: await reservationRepository.findByTableDateTime(
          table.id,
          date,
          time
        ),
      }))
    );

    return tableAvailability
      .filter(({ reservation }) => !reservation)
      .map(({ table }) => table);
  }

  async function checkAvailability({
    restaurantId,
    date,
    time,
    guests,
    tableCategory,
  }: AvailabilityRequest & {
    restaurantId: string;
    guests?: string | number;
  }): Promise<AvailabilityResponse> {
    if (!restaurantId || !date || !time || !guests) {
      throw new AppError("Restaurant, date, time, and guests are required.", 400);
    }

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    const normalizedCategory = normalizeTableCategory(tableCategory);
    const availableTables = await getAvailableTables(
      restaurantId,
      date,
      time,
      parsedGuests,
      normalizedCategory
    );

    return {
      available: availableTables.length > 0,
      slots: availableTables.length ? [time] : [],
      tables: availableTables.map((table) => ({
        id: table.id,
        name: table.name,
        category: table.category,
        capacity: table.capacity,
      })),
    };
  }

  async function createReservation(
    payload: ReservationRequest & { restaurantId: string; userId?: string | null }
  ): Promise<Reservation> {
    const { restaurantId, userId, tableId, tableCategory, date, time, guests, name, contact } = payload;
    assertRequiredFields({ tableId, date, time, guests, name, contact });

    if (!restaurantId) {
      throw new AppError("Restaurant is required for booking.", 400);
    }

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    const tables = await tableRepository.findByRestaurantId(restaurantId);
    const selectedTable = tables.find((table) => table.id === tableId);

    if (!selectedTable || !selectedTable.isActive) {
      throw new AppError("Select an available restaurant table.", 400);
    }

    const normalizedCategory = normalizeTableCategory(tableCategory);
    if (normalizedCategory !== "ANY" && selectedTable.category !== normalizedCategory) {
      throw new AppError("Selected table does not match the requested category.", 400);
    }

    if (selectedTable.capacity < parsedGuests) {
      throw new AppError("Selected table does not have enough seats.", 400);
    }

    const existingReservation = await reservationRepository.findByTableDateTime(
      tableId as string,
      date as string,
      time as string
    );
    if (existingReservation) {
      throw new AppError("This table is already booked for the selected time.", 409);
    }

    const reservation: Reservation = {
      id: crypto.randomUUID(),
      restaurantId,
      userId: userId || null,
      tableId: tableId as string,
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
    updateUserReservation,
    cancelUserReservation,
    listRestaurantReservations: reservationRepository.findByRestaurantId,
    listUserReservations: reservationRepository.findByUserId,
  };
}

export default createReservationService;
