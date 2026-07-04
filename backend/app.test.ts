import assert from "node:assert/strict";
import fs from "fs";
import type { Express } from "express";
import http from "http";
import os from "os";
import path from "path";
import test from "node:test";

type TestResponse<TBody = Record<string, unknown>> = {
  statusCode: number;
  body: TBody | null;
  rawBody: string;
};

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "restaurant-booking-"));
process.env.NODE_ENV = "test";
process.env.DATA_DIR = tempDir;
const app = require("./app").default as Express;

function makeRequest<TBody = Record<string, unknown>>(
  pathname: string,
  method: string,
  body?: Record<string, unknown>,
  headers: Record<string, string> = {}
): Promise<TestResponse<TBody>> {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      const payload = body ? JSON.stringify(body) : undefined;

      const request = http.request(
        {
          hostname: "127.0.0.1",
          port,
          path: pathname,
          method,
          headers: payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
                ...headers,
              }
            : headers,
        },
        (response) => {
          let responseBody = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            responseBody += chunk;
          });
          response.on("end", () => {
            server.close(() => {
              let parsedBody: TBody | null = null;

              try {
                parsedBody = responseBody ? JSON.parse(responseBody) : null;
              } catch {
                parsedBody = null;
              }

              resolve({
                statusCode: response.statusCode || 500,
                body: parsedBody,
                rawBody: responseBody,
              });
            });
          });
        }
      );

      request.on("error", (error) => {
        server.close(() => reject(error));
      });

      if (payload) {
        request.write(payload);
      }

      request.end();
    });
  });
}

async function registerTestRestaurant(email = "owner@greenfork.test") {
  const response = await makeRequest<{
    token: string;
    restaurant: { id: string; email: string };
  }>("/api/auth/register", "POST", {
    name: "The Green Fork",
    email,
    password: "securepass123",
  });

  assert.equal(response.statusCode, 201);
  assert.ok(response.body);

  return response.body;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

test.beforeEach(() => {
  fs.writeFileSync(path.join(tempDir, "reservations.json"), "[]", "utf8");
  fs.writeFileSync(path.join(tempDir, "restaurants.json"), "[]", "utf8");
  fs.writeFileSync(path.join(tempDir, "users.json"), "[]", "utf8");
  fs.writeFileSync(path.join(tempDir, "tables.json"), "[]", "utf8");
});

test("health endpoint responds successfully", async () => {
  const response = await makeRequest<{
    ok: boolean;
    service: string;
    environment: string;
    storage: string;
    uptime: number;
    timestamp: string;
  }>("/api/health", "GET");

  assert.equal(response.statusCode, 200);
  assert.ok(response.body);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.service, "restaurant-booking-api");
  assert.equal(response.body.storage, "file");
  assert.equal(typeof response.body.uptime, "number");
  assert.equal(typeof response.body.timestamp, "string");
});

test("database health endpoint reflects file storage in test mode", async () => {
  const response = await makeRequest<{
    ok: boolean;
    storage: string;
    checks?: Record<string, boolean>;
    timestamp: string;
  }>("/api/health/db", "GET");

  assert.equal(response.statusCode, 200);
  assert.ok(response.body);
  assert.equal(response.body.ok, true);
  assert.equal(response.body.storage, "file");
  assert.equal(typeof response.body.timestamp, "string");
});

test("swagger docs endpoint serves API documentation", async () => {
  const response = await makeRequest("/api/docs", "GET");

  assert.equal(response.statusCode, 200);
  assert.match(response.rawBody, /SwaggerUIBundle|Restaurant Booking API Docs/i);
});

test("swagger docs endpoint works with trailing slash", async () => {
  const response = await makeRequest("/api/docs/", "GET");

  assert.equal(response.statusCode, 200);
  assert.match(response.rawBody, /SwaggerUIBundle|Restaurant Booking API Docs/i);
});

test("openapi json endpoint exposes the API specification", async () => {
  const response = await makeRequest<{ openapi: string; info: { title: string } }>(
    "/api/docs/openapi.json",
    "GET"
  );

  assert.equal(response.statusCode, 200);
  assert.ok(response.body);
  assert.equal(response.body.openapi, "3.0.3");
  assert.equal(response.body.info.title, "Restaurant Table Booking API");
});

test("restaurant register creates an account and returns a token", async () => {
  const response = await makeRequest<{
    token: string;
    restaurant: { name: string; email: string; passwordHash?: string };
  }>("/api/auth/register", "POST", {
    name: "The Green Fork",
    email: "owner@greenfork.test",
    password: "securepass123",
    phone: "9999999999",
    address: "12 Market Street",
  });

  assert.equal(response.statusCode, 201);
  assert.ok(response.body);
  assert.equal(typeof response.body.token, "string");
  assert.equal(response.body.restaurant.name, "The Green Fork");
  assert.equal(response.body.restaurant.email, "owner@greenfork.test");
  assert.equal(response.body.restaurant.passwordHash, undefined);
});

test("restaurant login returns the existing account", async () => {
  const credentials = {
    email: "owner@greenfork.test",
    password: "securepass123",
  };

  await makeRequest("/api/auth/register", "POST", {
    name: "The Green Fork",
    ...credentials,
  });
  const response = await makeRequest<{
    token: string;
    restaurant: { email: string };
  }>("/api/auth/login", "POST", credentials);

  assert.equal(response.statusCode, 200);
  assert.ok(response.body);
  assert.equal(typeof response.body.token, "string");
  assert.equal(response.body.restaurant.email, "owner@greenfork.test");
});

test("duplicate restaurant register is rejected", async () => {
  const restaurant = {
    name: "The Green Fork",
    email: "owner@greenfork.test",
    password: "securepass123",
  };

  await makeRequest("/api/auth/register", "POST", restaurant);
  const response = await makeRequest<{ error: string }>(
    "/api/auth/register",
    "POST",
    restaurant
  );

  assert.equal(response.statusCode, 409);
  assert.ok(response.body);
  assert.equal(
    response.body.error,
    "A restaurant account already exists for this email."
  );
});

test("availability is true before a reservation exists", async () => {
  const { token } = await registerTestRestaurant();
  const response = await makeRequest<{ available: boolean; slots: string[] }>(
    "/api/check-availability",
    "POST",
    {
      date: "2026-07-15",
      time: "19:00",
    },
    authHeaders(token)
  );

  assert.equal(response.statusCode, 200);
  assert.ok(response.body);
  assert.equal(response.body.available, true);
  assert.deepEqual(response.body.slots, ["19:00"]);
});

test("reservation endpoints require restaurant login", async () => {
  const response = await makeRequest<{ error: string }>(
    "/api/check-availability",
    "POST",
    {
      date: "2026-07-15",
      time: "19:00",
    }
  );

  assert.equal(response.statusCode, 401);
  assert.ok(response.body);
  assert.equal(response.body.error, "Restaurant login is required.");
});

test("booking a table persists the reservation", async () => {
  const { token, restaurant } = await registerTestRestaurant();
  const booking = {
    date: "2026-07-15",
    time: "19:00",
    guests: 4,
    name: "Asha",
    contact: "9999999999",
  };

  const response = await makeRequest<{ guests: number; restaurantId: string }>(
    "/api/book-table",
    "POST",
    booking,
    authHeaders(token)
  );

  assert.equal(response.statusCode, 201);
  assert.ok(response.body);
  assert.equal(response.body.guests, 4);
  assert.equal(response.body.restaurantId, restaurant.id);

  const storedReservations = JSON.parse(
    fs.readFileSync(path.join(tempDir, "reservations.json"), "utf8")
  );
  assert.equal(storedReservations.length, 1);
  assert.equal(storedReservations[0].name, "Asha");
  assert.equal(storedReservations[0].restaurantId, restaurant.id);
});

test("duplicate bookings are rejected", async () => {
  const { token } = await registerTestRestaurant();
  const booking = {
    date: "2026-07-15",
    time: "19:00",
    guests: 4,
    name: "Asha",
    contact: "9999999999",
  };

  await makeRequest("/api/book-table", "POST", booking, authHeaders(token));
  const response = await makeRequest<{ error: string }>(
    "/api/book-table",
    "POST",
    booking,
    authHeaders(token)
  );

  assert.equal(response.statusCode, 409);
  assert.ok(response.body);
  assert.equal(response.body.error, "This time slot is already booked.");
});

test("different restaurants can book the same time slot independently", async () => {
  const firstRestaurant = await registerTestRestaurant("first@greenfork.test");
  const secondRestaurant = await registerTestRestaurant("second@greenfork.test");
  const booking = {
    date: "2026-07-15",
    time: "19:00",
    guests: 4,
    name: "Asha",
    contact: "9999999999",
  };

  const firstResponse = await makeRequest(
    "/api/book-table",
    "POST",
    booking,
    authHeaders(firstRestaurant.token)
  );
  const secondResponse = await makeRequest(
    "/api/book-table",
    "POST",
    booking,
    authHeaders(secondRestaurant.token)
  );

  assert.equal(firstResponse.statusCode, 201);
  assert.equal(secondResponse.statusCode, 201);
});
