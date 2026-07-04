import crypto from "crypto";
import { promisify } from "util";
import { env } from "../config/env";
import AppError from "../errors/AppError";
import type { AuthResponse, AuthRole, LoginRequest } from "../types/auth";
import type {
  RegisterRestaurantRequest,
  Restaurant,
  RestaurantRecord,
  RestaurantRepository,
} from "../types/restaurant";
import type {
  RegisterUserRequest,
  User,
  UserRecord,
  UserRepository,
} from "../types/user";

const scrypt = promisify(crypto.scrypt);
const tokenTtlSeconds = 60 * 60 * 24 * 7;

function createAuthService(
  restaurantRepository: RestaurantRepository,
  userRepository: UserRepository
) {
  function sanitizeRestaurant(restaurant: RestaurantRecord): Restaurant {
    const { passwordHash, ...safeRestaurant } = restaurant;
    return safeRestaurant;
  }

  function sanitizeUser(user: UserRecord): User {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  function assertEmail(email: string): void {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      throw new AppError("Enter a valid restaurant email address.", 400);
    }
  }

  async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${hash.toString("hex")}`;
  }

  async function verifyPassword(
    password: string,
    storedPasswordHash: string
  ): Promise<boolean> {
    const [salt, storedHash] = storedPasswordHash.split(":");

    if (!salt || !storedHash) {
      return false;
    }

    const hash = (await scrypt(password, salt, 64)) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, "hex");

    return (
      hash.length === storedHashBuffer.length &&
      crypto.timingSafeEqual(hash, storedHashBuffer)
    );
  }

  function base64Url(input: Buffer | string): string {
    return Buffer.from(input).toString("base64url");
  }

  function signToken(account: Restaurant | User, role: AuthRole): string {
    const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = base64Url(
      JSON.stringify({
        sub: account.id,
        email: account.email,
        name: account.name,
        role,
        exp: Math.floor(Date.now() / 1000) + tokenTtlSeconds,
      })
    );
    const signature = crypto
      .createHmac("sha256", env.jwtSecret)
      .update(`${header}.${payload}`)
      .digest("base64url");

    return `${header}.${payload}.${signature}`;
  }

  async function registerRestaurant(
    payload: RegisterRestaurantRequest
  ): Promise<AuthResponse> {
    const name = payload.name?.trim();
    const email = payload.email ? normalizeEmail(payload.email) : "";
    const password = payload.password || "";
    const phone = payload.phone?.trim() || null;
    const address = payload.address?.trim() || null;
    const city = payload.city?.trim();
    const openingTime = payload.openingTime?.trim() || "10:00";
    const closingTime = payload.closingTime?.trim() || "22:00";

    if (!name || !email || !password || !city) {
      throw new AppError("Restaurant name, city, email, and password are required.", 400);
    }

    assertEmail(email);

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const existingRestaurant = await restaurantRepository.findByEmail(email);
    if (existingRestaurant) {
      throw new AppError("A restaurant account already exists for this email.", 409);
    }

    const restaurant = await restaurantRepository.create({
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      address,
      city,
      openingTime,
      closingTime,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    const safeRestaurant = sanitizeRestaurant(restaurant);

    return {
      token: signToken(safeRestaurant, "restaurant"),
      role: "restaurant",
      restaurant: safeRestaurant,
    };
  }

  async function loginRestaurant(payload: LoginRequest): Promise<AuthResponse> {
    const email = payload.email ? normalizeEmail(payload.email) : "";
    const password = payload.password || "";

    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const restaurant = await restaurantRepository.findByEmail(email);
    const isPasswordValid =
      restaurant && (await verifyPassword(password, restaurant.passwordHash));

    if (!restaurant || !isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    const safeRestaurant = sanitizeRestaurant(restaurant);

    return {
      token: signToken(safeRestaurant, "restaurant"),
      role: "restaurant",
      restaurant: safeRestaurant,
    };
  }

  async function registerUser(payload: RegisterUserRequest): Promise<AuthResponse> {
    const name = payload.name?.trim();
    const email = payload.email ? normalizeEmail(payload.email) : "";
    const password = payload.password || "";
    const phone = payload.phone?.trim() || null;

    if (!name || !email || !password) {
      throw new AppError("Name, email, and password are required.", 400);
    }

    assertEmail(email);

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters.", 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("A user account already exists for this email.", 409);
    }

    const user = await userRepository.create({
      id: crypto.randomUUID(),
      name,
      email,
      phone,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    });
    const safeUser = sanitizeUser(user);

    return {
      token: signToken(safeUser, "user"),
      role: "user",
      user: safeUser,
    };
  }

  async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
    const email = payload.email ? normalizeEmail(payload.email) : "";
    const password = payload.password || "";

    if (!email || !password) {
      throw new AppError("Email and password are required.", 400);
    }

    const user = await userRepository.findByEmail(email);
    const isPasswordValid =
      user && (await verifyPassword(password, user.passwordHash));

    if (!user || !isPasswordValid) {
      throw new AppError("Invalid email or password.", 401);
    }

    const safeUser = sanitizeUser(user);

    return {
      token: signToken(safeUser, "user"),
      role: "user",
      user: safeUser,
    };
  }

  return {
    registerRestaurant,
    loginRestaurant,
    registerUser,
    loginUser,
  };
}

export default createAuthService;
