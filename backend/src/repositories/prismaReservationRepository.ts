import prisma from "../lib/prisma";
import type { Reservation, ReservationRepository } from "../types/reservation";

type PrismaReservation = {
  id: string;
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

  async function findByDateTime(
    date: string,
    time: string
  ): Promise<Reservation | null> {
    const reservation = await prisma.reservation.findUnique({
      where: {
        date_time: {
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

  return {
    findAll,
    findByDateTime,
    create,
  };
}

export default createPrismaReservationRepository;
