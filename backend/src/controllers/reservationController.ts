import type { RequestHandler } from "express";
import type { AuthenticatedRequest } from "../middleware/requireRestaurantAuth";
import type createReservationService from "../services/reservationService";

type ReservationService = ReturnType<typeof createReservationService>;

function createReservationController(reservationService: ReservationService) {
  const checkAvailability: RequestHandler = async (req, res, next) => {
    try {
      const { authRole, restaurantId } = req as AuthenticatedRequest;
      const availability = await reservationService.checkAvailability({
        ...req.body,
        restaurantId:
          authRole === "restaurant"
            ? (restaurantId as string)
            : (req.body.restaurantId as string),
      });
      res.json(availability);
    } catch (error) {
      next(error);
    }
  };

  const createReservation: RequestHandler = async (req, res, next) => {
    try {
      const { authRole, restaurantId, userId } = req as AuthenticatedRequest;
      const reservation = await reservationService.createReservation({
        ...req.body,
        restaurantId:
          authRole === "restaurant"
            ? (restaurantId as string)
            : (req.body.restaurantId as string),
        userId: authRole === "user" ? userId : null,
      });
      res.status(201).json(reservation);
    } catch (error) {
      next(error);
    }
  };

  const listMyReservations: RequestHandler = async (req, res, next) => {
    try {
      const { authRole, restaurantId, userId } = req as AuthenticatedRequest;
      const reservations =
        authRole === "restaurant"
          ? await reservationService.listRestaurantReservations(
              restaurantId as string
            )
          : await reservationService.listUserReservations(userId as string);

      res.json(reservations);
    } catch (error) {
      next(error);
    }
  };

  return {
    checkAvailability,
    createReservation,
    listMyReservations,
  };
}

export default createReservationController;
