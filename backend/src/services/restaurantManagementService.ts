import crypto from "crypto";
import AppError from "../errors/AppError";
import type { EventSpace, EventSpaceRepository, EventSpaceRequest } from "../types/eventSpace";
import type { RestaurantRepository } from "../types/restaurant";
import type { ReservationRepository } from "../types/reservation";
import type { RestaurantTable, TableRepository, TableRequest } from "../types/table";

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
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
    listTables,
    listEventSpaces,
    createTable,
    updateTable,
    updateAvailability,
    createEventSpace,
  };
}

export default createRestaurantManagementService;
