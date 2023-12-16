import eventRoutes from "./events.js";
import playerRoutes from "./players.js";
import frontendPlayerRoutes from "./frontend-players.js";
import frontendAuthRoutes from "./frontend-auth.js";
// import * as playerRoutes from './players.js';

const constructorMethod = (app) => {
  // app.use('/players', playerRoutes);
  app.use("/", frontendAuthRoutes);
  app.use("/players", frontendPlayerRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/players", playerRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ error: "Route Not found" });
  });
};

export default constructorMethod;
