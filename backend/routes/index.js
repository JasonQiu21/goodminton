import eventRoutes from "./events.js";
import playerRoutes from "./players.js";
import authRoutes from './auth.js'

const constructorMethod = (app) => {
  app.use("/api/", authRoutes)
  app.use("/api/events", eventRoutes);
  app.use("/api/players", playerRoutes);

  app.use("*", (req, res) => {
    res.status(404).json({ status: 404, error: "Page not found." });
  });
};

export default constructorMethod;