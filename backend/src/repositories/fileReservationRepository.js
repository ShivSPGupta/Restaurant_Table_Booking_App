const fs = require("fs");
const path = require("path");

function createFileReservationRepository(dataDir) {
  const reservationsFile = path.join(dataDir, "reservations.json");

  function ensureStorage() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(reservationsFile)) {
      fs.writeFileSync(reservationsFile, "[]", "utf8");
    }
  }

  function findAll() {
    ensureStorage();

    try {
      const fileContents = fs.readFileSync(reservationsFile, "utf8");
      const reservations = JSON.parse(fileContents);
      return Array.isArray(reservations) ? reservations : [];
    } catch (error) {
      return [];
    }
  }

  function saveAll(reservations) {
    ensureStorage();
    fs.writeFileSync(
      reservationsFile,
      JSON.stringify(reservations, null, 2),
      "utf8"
    );
  }

  function findByDateTime(date, time) {
    return findAll().find(
      (reservation) => reservation.date === date && reservation.time === time
    );
  }

  function create(reservation) {
    const reservations = findAll();
    reservations.push(reservation);
    saveAll(reservations);
    return reservation;
  }

  return {
    findAll,
    findByDateTime,
    create,
  };
}

module.exports = createFileReservationRepository;
