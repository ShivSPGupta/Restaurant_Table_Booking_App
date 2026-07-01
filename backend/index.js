const app = require("./app");
const { env } = require("./src/config/env");

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

module.exports = app;
