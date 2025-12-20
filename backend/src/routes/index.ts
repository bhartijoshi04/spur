import { Router } from "express";
import { aiRoutes } from "./ai.routes.js";

export const routes = Router();

routes.use("/ai", aiRoutes);
