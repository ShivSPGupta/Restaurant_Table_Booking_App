import { Router } from "express";
import type createAuthController from "../controllers/authController";

type AuthController = ReturnType<typeof createAuthController>;

function createAuthRoutes(authController: AuthController) {
  const router = Router();

  router.post("/restaurant/register", authController.registerRestaurant);
  router.post("/restaurant/login", authController.loginRestaurant);
  router.post("/user/register", authController.registerUser);
  router.post("/user/login", authController.loginUser);

  // Backward-compatible restaurant auth aliases.
  router.post("/register", authController.registerRestaurant);
  router.post("/login", authController.loginRestaurant);

  return router;
}

export default createAuthRoutes;
