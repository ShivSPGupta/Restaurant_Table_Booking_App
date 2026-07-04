import { Router } from "express";
import type createPublicRestaurantController from "../controllers/publicRestaurantController";

type PublicRestaurantController = ReturnType<
  typeof createPublicRestaurantController
>;

function createPublicRestaurantRoutes(
  publicRestaurantController: PublicRestaurantController
) {
  const router = Router();

  router.get("/", publicRestaurantController.listRestaurants);

  return router;
}

export default createPublicRestaurantRoutes;
