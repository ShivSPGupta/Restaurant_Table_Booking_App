import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "../docs/openApiSpec";

const docsRoutes = Router();

docsRoutes.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

docsRoutes.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: "Restaurant Booking API Docs",
  })
);

export default docsRoutes;
