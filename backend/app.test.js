const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "restaurant-booking-"));
process.env.DATA_DIR = tempDir;

const app = require("./app");

function makeRequest(pathname, method, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const payload = body ? JSON.stringify(body) : undefined;

      const request = require("http").request(
        {
          hostname: "127.0.0.1",
          port,
          path: pathname,
          method,
          headers: payload
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(payload),
              }
            : {},
        },
        (response) => {
          let responseBody = "";
          response.setEncoding("utf8");
          response.on("data", (chunk) => {
            responseBody += chunk;
          });
          response.on("end", () => {
            server.close(() => {
              resolve({
                statusCode: response.statusCode,
                body: responseBody ? JSON.parse(responseBody) : null,
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

test.beforeEach(() => {
  fs.writeFileSync(path.join(tempDir, "reservations.json"), "[]", "utf8");
});

test("health endpoint responds successfully", async () => {
  const response = await makeRequest("/api/health", "GET");

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, { ok: true });
});

test("availability is true before a reservation exists", async () => {
  const response = await makeRequest("/api/check-availability", "POST", {
    date: "2026-07-15",
    time: "19:00",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.available, true);
  assert.deepEqual(response.body.slots, ["19:00"]);
});

test("booking a table persists the reservation", async () => {
  const booking = {
    date: "2026-07-15",
    time: "19:00",
    guests: 4,
    name: "Asha",
    contact: "9999999999",
  };

  const response = await makeRequest("/api/book-table", "POST", booking);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.guests, 4);

  const storedReservations = JSON.parse(
    fs.readFileSync(path.join(tempDir, "reservations.json"), "utf8")
  );
  assert.equal(storedReservations.length, 1);
  assert.equal(storedReservations[0].name, "Asha");
});

test("duplicate bookings are rejected", async () => {
  const booking = {
    date: "2026-07-15",
    time: "19:00",
    guests: 4,
    name: "Asha",
    contact: "9999999999",
  };

  await makeRequest("/api/book-table", "POST", booking);
  const response = await makeRequest("/api/book-table", "POST", booking);

  assert.equal(response.statusCode, 409);
  assert.equal(response.body.error, "This time slot is already booked.");
});
