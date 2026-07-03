import crypto from "crypto";
import type { Request, RequestHandler } from "express";
import { env } from "../config/env";
import AppError from "../errors/AppError";

export type AuthenticatedRequest = Request & {
  restaurantId?: string;
};

type TokenPayload = {
  sub?: string;
  exp?: number;
};

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function decodePayload(payload: string): TokenPayload {
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
}

const requireRestaurantAuth: RequestHandler = (req, _res, next) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice("Bearer ".length)
      : "";

    if (!token) {
      throw new AppError("Restaurant login is required.", 401);
    }

    const [header, payload, signature] = token.split(".");

    if (!header || !payload || !signature) {
      throw new AppError("Invalid auth token.", 401);
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (
      expectedSignature.length !== signature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      )
    ) {
      throw new AppError("Invalid auth token.", 401);
    }

    const decodedPayload = decodePayload(payload);

    if (!decodedPayload.sub) {
      throw new AppError("Invalid auth token.", 401);
    }

    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      throw new AppError("Auth token has expired. Please login again.", 401);
    }

    (req as AuthenticatedRequest).restaurantId = decodedPayload.sub;
    next();
  } catch (error) {
    next(error instanceof AppError ? error : new AppError("Invalid auth token.", 401));
  }
};

export default requireRestaurantAuth;
