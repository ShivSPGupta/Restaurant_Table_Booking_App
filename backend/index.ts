import app from "./app";
import { env } from "./src/config/env";

if (require.main === module) {
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

export default app;
