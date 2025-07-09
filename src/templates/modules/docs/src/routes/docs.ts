import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger";

const docsRouter = express.Router();

docsRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default docsRouter;
