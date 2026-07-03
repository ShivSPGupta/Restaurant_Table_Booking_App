import { env } from "../config/env";
import createFileRestaurantRepository from "./fileRestaurantRepository";

function createRestaurantRepository() {
  if (env.databaseUrl) {
    const createPrismaRestaurantRepository =
      require("./prismaRestaurantRepository").default;
    return createPrismaRestaurantRepository();
  }

  return createFileRestaurantRepository(env.dataDir);
}

export default createRestaurantRepository;
