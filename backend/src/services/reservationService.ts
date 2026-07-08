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
import type {
  EventSpace,
  EventSpaceCategory,
  EventSpaceRepository,
} from "../types/eventSpace";

const bookingTableCategories = ["PUBLIC", "COUPLE", "FAMILY", "SPECIAL"] as const;
const eventSpaceCategories = [
  "MARRIAGE",
  "BIRTHDAY_PARTY",
  "RECEPTION",
  "GENERAL_PARTY",
  "GENERAL_EVENT",
] as const;

function isBookingTableCategory(
  category: string
): category is (typeof bookingTableCategories)[number] {
  return bookingTableCategories.some(
    (bookingCategory) => bookingCategory === category
  );
}

function normalizeBookingTableCategory(
  category?: TableCategory | "ANY"
): (typeof bookingTableCategories)[number] {
  if (!category || category === "ANY") {
    throw new AppError("Select Public, Couple, Family, or Special table type.", 400);
  }

  if (!isBookingTableCategory(category)) {
    throw new AppError("Select a valid table category.", 400);
  }

  return category;
}

function normalizeEventSpaceCategory(
  category?: EventSpaceCategory | "ANY"
): EventSpaceCategory {
  if (!category || category === "ANY") {
    throw new AppError("Select a specific event space category.", 400);
  }

  if (!eventSpaceCategories.includes(category)) {
    throw new AppError("Select a valid event space category.", 400);
  }

  return category;
}

function createReservationService(
  reservationRepository: ReservationRepository,
  tableRepository: TableRepository,
  eventSpaceRepository: EventSpaceRepository
) {
  function isValidTime(value: string): boolean {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
  }

  function timeToMinutes(value: string): number {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function assertValidEventTimeRange(startTime: string, endTime?: string): void {
    if (!isValidTime(startTime) || !endTime || !isValidTime(endTime)) {
      throw new AppError("Event start and end time must use HH:mm format.", 400);
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      throw new AppError("Event end time must be after start time.", 400);
    }
  }

  function hasTimeOverlap(
    existingStartTime: string,
    existingEndTime: string | null | undefined,
    nextStartTime: string,
    nextEndTime: string
  ): boolean {
    const existingStart = timeToMinutes(existingStartTime);
    const existingEnd = timeToMinutes(existingEndTime || existingStartTime);
    const nextStart = timeToMinutes(nextStartTime);
    const nextEnd = timeToMinutes(nextEndTime);

    return nextStart < existingEnd && existingStart < nextEnd;
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
    tableCategory: (typeof bookingTableCategories)[number]
  ): Promise<RestaurantTable[]> {
    const tables = await tableRepository.findByRestaurantId(restaurantId);
    const activeTables = tables.filter(
      (table) =>
        table.isActive &&
        table.capacity >= guests &&
        table.category === tableCategory
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

  async function getAvailableEventSpaces(
    restaurantId: string,
    date: string,
    time: string,
    endTime: string,
    guests: number,
    eventSpaceCategory: EventSpaceCategory
  ): Promise<EventSpace[]> {
    const spaces = await eventSpaceRepository.findByRestaurantId(restaurantId);
    const activeSpaces = spaces.filter(
      (space) =>
        space.isActive &&
        space.capacity >= guests &&
        space.category === eventSpaceCategory
    );
    const spaceAvailability = await Promise.all(
      activeSpaces.map(async (space) => ({
        space,
        reservation: await reservationRepository.findByEventSpaceDateTime(
          space.id,
          date,
          time
        ),
        dateReservations: await reservationRepository.findByEventSpaceDate(
          space.id,
          date
        ),
      }))
    );

    return spaceAvailability
      .filter(
        ({ reservation, dateReservations }) =>
          !reservation &&
          !dateReservations.some((dateReservation) =>
            hasTimeOverlap(
              dateReservation.time,
              dateReservation.endTime,
              time,
              endTime
            )
          )
      )
      .map(({ space }) => space);
  }

  async function checkAvailability({
    restaurantId,
    date,
    time,
    endTime,
    guests,
    tableCategory,
    bookingType,
    eventSpaceCategory,
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

    const normalizedBookingType = bookingType || "TABLE";

    if (normalizedBookingType === "EVENT_SPACE") {
      assertValidEventTimeRange(time, endTime);
      const normalizedCategory = normalizeEventSpaceCategory(eventSpaceCategory);
      const availableEventSpaces = await getAvailableEventSpaces(
        restaurantId,
        date,
        time,
        endTime as string,
        parsedGuests,
        normalizedCategory
      );

      return {
        available: availableEventSpaces.length > 0,
        slots: availableEventSpaces.length ? [time] : [],
        tables: [],
        eventSpaces: availableEventSpaces.map((space) => ({
          id: space.id,
          name: space.name,
          category: space.category,
          capacity: space.capacity,
          price: space.price,
        })),
      };
    }

    const normalizedCategory = normalizeBookingTableCategory(tableCategory);
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
      eventSpaces: [],
    };
  }

  async function createReservation(
    payload: ReservationRequest & { restaurantId: string; userId?: string | null }
  ): Promise<Reservation> {
    const {
      restaurantId,
      userId,
      tableId,
      eventSpaceId,
      bookingType,
      tableCategory,
      eventSpaceCategory,
      date,
      time,
      endTime,
      guests,
      name,
      contact,
    } = payload;
    const normalizedBookingType = bookingType || "TABLE";
    assertRequiredFields({ date, time, guests, name, contact });

    if (!restaurantId) {
      throw new AppError("Restaurant is required for booking.", 400);
    }

    const parsedGuests = Number(guests);
    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      throw new AppError("Guests must be a whole number greater than 0.", 400);
    }

    if (normalizedBookingType === "EVENT_SPACE") {
      assertRequiredFields({ eventSpaceId, endTime });
      assertValidEventTimeRange(time as string, endTime);

      const spaces = await eventSpaceRepository.findByRestaurantId(restaurantId);
      const selectedSpace = spaces.find((space) => space.id === eventSpaceId);

      if (!selectedSpace || !selectedSpace.isActive) {
        throw new AppError("Select an available event space.", 400);
      }

      const normalizedCategory = normalizeEventSpaceCategory(eventSpaceCategory);
      if (selectedSpace.category !== normalizedCategory) {
        throw new AppError(
          "Selected event space does not match the requested category.",
          400
        );
      }

      if (selectedSpace.capacity < parsedGuests) {
        throw new AppError("Selected event space does not have enough capacity.", 400);
      }

      const existingReservations = await reservationRepository.findByEventSpaceDate(
        eventSpaceId as string,
        date as string
      );
      const overlappingReservation = existingReservations.find((reservation) =>
        hasTimeOverlap(
          reservation.time,
          reservation.endTime,
          time as string,
          endTime as string
        )
      );
      if (overlappingReservation) {
        throw new AppError(
          "This event space is already booked during the selected time.",
          409
        );
      }

      return reservationRepository.create({
        id: crypto.randomUUID(),
        restaurantId,
        userId: userId || null,
        tableId: null,
        eventSpaceId: eventSpaceId as string,
        bookingType: "EVENT_SPACE",
        date: date as string,
        time: time as string,
        endTime: endTime as string,
        guests: parsedGuests,
        name: (name as string).trim(),
        contact: (contact as string).trim(),
        createdAt: new Date().toISOString(),
      });
    }

    assertRequiredFields({ tableId });
    const tables = await tableRepository.findByRestaurantId(restaurantId);
    const selectedTable = tables.find((table) => table.id === tableId);

    if (!selectedTable || !selectedTable.isActive) {
      throw new AppError("Select an available restaurant table.", 400);
    }

    const normalizedCategory = normalizeBookingTableCategory(tableCategory);
    if (selectedTable.category !== normalizedCategory) {
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
      eventSpaceId: null,
      bookingType: "TABLE",
      date: date as string,
      time: time as string,
      endTime: null,
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
