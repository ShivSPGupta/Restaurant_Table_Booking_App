import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/requireRestaurantAuth";
import type createReservationService from "../services/reservationService";

type ReservationService = ReturnType<typeof createReservationService>;

function createReservationController(reservationService: ReservationService) {
  const checkAvailability: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const availability = await reservationService.checkAvailability({
        ...req.body,
        restaurantId: restaurantId as string,
      });
      res.json(availability);
    } catch (error) {
      next(error);
    }
  };

  const createReservation: RequestHandler = async (req, res, next) => {
    try {
      const { restaurantId } = req as AuthenticatedRequest;
      const reservation = await reservationService.createReservation({
        ...req.body,
        restaurantId: restaurantId as string,
      });
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  };

  return {
    checkAvailability,
    createReservation,
  };
}

export default createReservationController;
