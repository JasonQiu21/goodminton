import playerRoutes from './players.js';
import eventRoutes from './events.js';

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
    res.status(404).render("error", { error: "Not Found", user: req.session?.user, id: req.session?.id });
  });
};
export default constructorMethod;