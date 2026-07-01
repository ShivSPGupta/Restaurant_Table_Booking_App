const path = require("path");

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 3001,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  dataDir: process.env.DATA_DIR || path.join(__dirname, "..", "..", "data"),
};

function getAllowedOrigins() {
  if (!env.corsOrigin || env.corsOrigin === "*") {
    return true;
  }

  return env.corsOrigin.split(",").map((origin) => origin.trim());
}

module.exports = {
  env,
  getAllowedOrigins,
};
