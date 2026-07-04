import type { RequestHandler } from "express";
import type createAuthService from "../services/authService";

type AuthService = ReturnType<typeof createAuthService>;

function createAuthController(authService: AuthService) {
  const registerRestaurant: RequestHandler = async (req, res, next) => {
    try {
      const authResponse = await authService.registerRestaurant(req.body);
      res.status(201).json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  const loginRestaurant: RequestHandler = async (req, res, next) => {
    try {
      const authResponse = await authService.loginRestaurant(req.body);
      res.json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  const registerUser: RequestHandler = async (req, res, next) => {
    try {
      const authResponse = await authService.registerUser(req.body);
      res.status(201).json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  const loginUser: RequestHandler = async (req, res, next) => {
    try {
      const authResponse = await authService.loginUser(req.body);
      res.json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  return {
    registerRestaurant,
    loginRestaurant,
    registerUser,
    loginUser,
  };
}

export default createAuthController;
