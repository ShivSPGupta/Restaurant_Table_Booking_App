import prisma from "../lib/prisma";
import type { Reservation, ReservationRepository } from "../types/reservation";

type PrismaReservation = {
  id: string;
  restaurantId: string;
  userId: string | null;
  tableId: string | null;
  date: string;
  time: string;
  guests: number;
  name: string;
  contact: string;
  createdAt: Date;
};

function mapReservation(reservation: PrismaReservation): Reservation {
  return {
    ...reservation,
    createdAt: reservation.createdAt.toISOString(),
  };
}

function createPrismaReservationRepository(): ReservationRepository {
  async function findAll(): Promise<Reservation[]> {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return reservations.map(mapReservation);
  }

  async function findByRestaurantId(restaurantId: string): Promise<Reservation[]> {
    const reservations = await prisma.reservation.findMany({
      where: { restaurantId },
      orderBy: { createdAt: "desc" },
    });

    return reservations.map(mapReservation);
  }

  async function findByUserId(userId: string): Promise<Reservation[]> {
    const reservations = await prisma.reservation.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return reservations.map(mapReservation);
  }

  async function findByDateTime(
    restaurantId: string,
    date: string,
    time: string
  ): Promise<Reservation | null> {
    const reservation = await prisma.reservation.findUnique({
      where: {
        restaurantId_date_time: {
          restaurantId,
          date,
          time,
        },
      },
    });

    return reservation ? mapReservation(reservation) : null;
  }

  async function create(reservation: Reservation): Promise<Reservation> {
    const createdReservation = await prisma.reservation.create({
      data: {
        id: reservation.id,
        restaurantId: reservation.restaurantId,
        userId: reservation.userId,
        tableId: reservation.tableId,
        date: reservation.date,
        time: reservation.time,
        guests: reservation.guests,
        name: reservation.name,
        contact: reservation.contact,
        createdAt: new Date(reservation.createdAt),
      },
    });

    return mapReservation(createdReservation);
  }

  async function update(
    restaurantId: string,
    reservationId: string,
    updates: Partial<Pick<Reservation, "tableId" | "date" | "time" | "guests" | "name" | "contact">>
  ): Promise<Reservation | null> {
    const existingReservation = await prisma.reservation.findFirst({
      where: { id: reservationId, restaurantId },
    });

    if (!existingReservation) {
      return null;
    }

    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updates,
    });

    return mapReservation(updatedReservation);
  }

  async function deleteReservation(
    restaurantId: string,
    reservationId: string
  ): Promise<boolean> {
    const existingReservation = await prisma.reservation.findFirst({
      where: { id: reservationId, restaurantId },
    });

    if (!existingReservation) {
      return false;
    }

    await prisma.reservation.delete({
      where: { id: reservationId },
    });

    return true;
  }

  return {
    findAll,
    findByRestaurantId,
    findByUserId,
    findByDateTime,
    create,
    update,
    delete: deleteReservation,
  };
}

export default createPrismaReservationRepository;
