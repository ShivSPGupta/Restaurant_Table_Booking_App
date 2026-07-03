import { Router } from "express";
import type createAuthController from "../controllers/authController";

type AuthController = ReturnType<typeof createAuthController>;

function createAuthRoutes(authController: AuthController) {
  const router = Router();

  router.post("/register", authController.registerRestaurant);
  router.post("/login", authController.loginRestaurant);

  return router;
}

export default createAuthRoutes;
