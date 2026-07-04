import crypto from "crypto";
import AppError from "../errors/AppError";
import type { EventSpace, EventSpaceRepository, EventSpaceRequest } from "../types/eventSpace";
import type { RestaurantRepository } from "../types/restaurant";
import type { ReservationRepository } from "../types/reservation";
import type { RestaurantTable, TableRepository, TableRequest } from "../types/table";

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeTableName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function createRestaurantManagementService(
  restaurantRepository: RestaurantRepository,
  reservationRepository: ReservationRepository,
  tableRepository: TableRepository,
  eventSpaceRepository: EventSpaceRepository
) {
  async function listReservations(restaurantId: string) {
    return reservationRepository.findByRestaurantId(restaurantId);
  }

  async function updateReservation(
    restaurantId: string,
    reservationId: string,
    payload: {
      tableId?: string | null;
      date?: string;
      time?: string;
      guests?: string | number;
      name?: string;
      contact?: string;
    }
  ) {
    const reservations = await reservationRepository.findByRestaurantId(
      restaurantId
    );
    const currentReservation = reservations.find(
      (reservation) => reservation.id === reservationId
    );

    if (!currentReservation) {
      throw new AppError("Reservation not found.", 404);
    }

    const updates: Parameters<typeof reservationRepository.update>[2] = {};

    if (payload.tableId !== undefined) {
      updates.tableId = payload.tableId || null;
    }

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

    if (nextDate !== currentReservation.date || nextTime !== currentReservation.time) {
      const duplicateReservation = await reservationRepository.findByDateTime(
        restaurantId,
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
      restaurantId,
      reservationId,
      updates
    );

    if (!reservation) {
      throw new AppError("Reservation not found.", 404);
    }

    return reservation;
  }

  async function cancelReservation(restaurantId: string, reservationId: string) {
    const wasDeleted = await reservationRepository.delete(
      restaurantId,
      reservationId
    );

    if (!wasDeleted) {
      throw new AppError("Reservation not found.", 404);
    }
  }

  async function listTables(restaurantId: string) {
    return tableRepository.findByRestaurantId(restaurantId);
  }

  async function listEventSpaces(restaurantId: string) {
    return eventSpaceRepository.findByRestaurantId(restaurantId);
  }

  async function createTable(
    restaurantId: string,
    payload: TableRequest
  ): Promise<RestaurantTable> {
    const name = payload.name?.trim();
    const capacity = Number(payload.capacity);

    if (!name || !Number.isInteger(capacity) || capacity < 1) {
      throw new AppError("Table name and valid capacity are required.", 400);
    }

    const existingTables = await tableRepository.findByRestaurantId(restaurantId);
    const duplicateTable = existingTables.find(
      (table) => normalizeTableName(table.name) === normalizeTableName(name)
    );

    if (duplicateTable) {
      throw new AppError("A table with this name already exists.", 409);
    }

    return tableRepository.create({
      id: crypto.randomUUID(),
      restaurantId,
      name,
      capacity,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
    });
  }

  async function updateTable(
    restaurantId: string,
    tableId: string,
    payload: TableRequest
  ) {
    const updates: Partial<Pick<RestaurantTable, "name" | "capacity" | "isActive">> = {};

    if (payload.name !== undefined) {
      updates.name = payload.name.trim();

      if (!updates.name) {
        throw new AppError("Table name cannot be empty.", 400);
      }

      const existingTables = await tableRepository.findByRestaurantId(restaurantId);
      const duplicateTable = existingTables.find(
        (table) =>
          table.id !== tableId &&
          normalizeTableName(table.name) === normalizeTableName(updates.name as string)
      );

      if (duplicateTable) {
        throw new AppError("A table with this name already exists.", 409);
      }
    }

    if (payload.capacity !== undefined) {
      const capacity = Number(payload.capacity);
      if (!Number.isInteger(capacity) || capacity < 1) {
        throw new AppError("Capacity must be a whole number greater than 0.", 400);
      }
      updates.capacity = capacity;
    }

    if (payload.isActive !== undefined) {
      updates.isActive = payload.isActive;
    }

    const table = await tableRepository.update(restaurantId, tableId, updates);

    if (!table) {
      throw new AppError("Table not found.", 404);
    }

    return table;
  }

  async function updateAvailability(
    restaurantId: string,
    payload: { openingTime?: string; closingTime?: string }
  ) {
    const openingTime = payload.openingTime?.trim();
    const closingTime = payload.closingTime?.trim();

    if (!openingTime || !closingTime || !isValidTime(openingTime) || !isValidTime(closingTime)) {
      throw new AppError("Opening and closing time must use HH:mm format.", 400);
    }

    if (openingTime >= closingTime) {
      throw new AppError("Opening time must be before closing time.", 400);
    }

    const restaurant = await restaurantRepository.updateAvailability(restaurantId, {
      openingTime,
      closingTime,
    });

    if (!restaurant) {
      throw new AppError("Restaurant not found.", 404);
    }

    const { passwordHash, ...safeRestaurant } = restaurant;
    return safeRestaurant;
  }

  async function createEventSpace(
    restaurantId: string,
    payload: EventSpaceRequest
  ): Promise<EventSpace> {
    const name = payload.name?.trim();
    const occasion = payload.occasion?.trim() || "Birthday";
    const capacity = Number(payload.capacity);
    const price =
      payload.price === undefined || payload.price === ""
        ? null
        : Number(payload.price);

    if (!name || !Number.isInteger(capacity) || capacity < 1) {
      throw new AppError("Space name and valid capacity are required.", 400);
    }

    if (price !== null && (!Number.isInteger(price) || price < 0)) {
      throw new AppError("Price must be a whole number greater than or equal to 0.", 400);
    }

    return eventSpaceRepository.create({
      id: crypto.randomUUID(),
      restaurantId,
      name,
      occasion,
      capacity,
      price,
      isActive: payload.isActive ?? true,
      createdAt: new Date().toISOString(),
    });
  }

  return {
    listReservations,
    updateReservation,
    cancelReservation,
    listTables,
    listEventSpaces,
    createTable,
    updateTable,
    updateAvailability,
    createEventSpace,
  };
}

export default createRestaurantManagementService;
