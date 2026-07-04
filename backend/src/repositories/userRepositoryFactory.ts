import { env } from "../config/env";
import createFileUserRepository from "./fileUserRepository";

function createUserRepository() {
  if (env.databaseUrl) {
    const createPrismaUserRepository = require("./prismaUserRepository").default;
    return createPrismaUserRepository();
  }

  return createFileUserRepository(env.dataDir);
}

export default createUserRepository;
