import eventsRoutes from "./events.js";
import path from "path";
import { static as staticDir } from "express";

const constructorMethod = (app) => {
  app.use("/events", eventsRoutes);
};

export default constructorMethod;
