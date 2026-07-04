import { env } from "../config/env";
import createFileTableRepository from "./fileTableRepository";

function createTableRepository() {
  if (env.databaseUrl) {
    const createPrismaTableRepository =
      require("./prismaTableRepository").default;
    return createPrismaTableRepository();
  }

  return createFileTableRepository(env.dataDir);
}

export default createTableRepository;
