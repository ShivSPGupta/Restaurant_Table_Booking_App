import { env } from "../config/env";
import createFileReservationRepository from "./fileReservationRepository";

function createReservationRepository() {
  if (env.databaseUrl) {
    const createPrismaReservationRepository =
      require("./prismaReservationRepository").default;
    return createPrismaReservationRepository();
  }

  return createFileReservationRepository(env.dataDir);
}

export default createReservationRepository;
