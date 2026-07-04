import { env } from "../config/env";
import createFileEventSpaceRepository from "./fileEventSpaceRepository";

function createEventSpaceRepository() {
  if (env.databaseUrl) {
    const createPrismaEventSpaceRepository =
      require("./prismaEventSpaceRepository").default;
    return createPrismaEventSpaceRepository();
  }

  return createFileEventSpaceRepository(env.dataDir);
}

export default createEventSpaceRepository;
