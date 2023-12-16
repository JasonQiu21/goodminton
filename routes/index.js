import eventRoutes from "./events.js";
import playerRoutes from "./players.js";
import authRoutes from "./auth.js";
import frontendRoutes from "./frontend.js";
// import * as playerRoutes from './players.js';

const constructorMethod = (app) => {
  // app.use('/players', playerRoutes);
  app.use("/events", eventRoutes);
  app.use("/players", playerRoutes);
  app.use("/", authRoutes);
  app.use("/", frontendRoutes)

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" });
  });
};

export default constructorMethod;
