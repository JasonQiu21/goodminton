import eventRoutes from "./events.js";
import playerRoutes from "./players.js";
import frontendPlayerRoutes from "./frontend-players.js";
import frontendLeaderboardRoutes from "./frontend-leaderboard.js";
import frontendAuthRoutes from "./frontend-auth.js";
import frontendEventRoutes from "./frontend-events.js";
import frontendCreateEventRoutes from "./frontend-createEvent.js";
// import * as playerRoutes from './players.js';

const constructorMethod = (app) => {
  // app.use('/players', playerRoutes);
  app.use("/", frontendAuthRoutes);
  app.use("/createEvent", frontendCreateEventRoutes);
  app.use("/leaderboard", frontendLeaderboardRoutes);

  app.use("/players", frontendPlayerRoutes);
  app.use("/events", frontendEventRoutes);

  app.use("/api/events", eventRoutes);
  app.use("/api/players", playerRoutes);

  app.use("*", (req, res) => {
    res.status(404).render("error", { error: "Not Found" });
  });
};

export default constructorMethod;
