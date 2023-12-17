import eventRoutes from "./events.js";
import playerRoutes from "./players.js";
import frontendPlayerRoutes from "./frontend-players.js";
import frontendEventRoutes from "./frontend-events.js";
import frontendAuthRoutes from "./frontend-auth.js";
import frontendLeaderboardRoutes from "./frontend-leaderboard.js";
// import * as playerRoutes from './players.js';

const constructorMethod = (app) => {
  app.use('/api/players', playerRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/players', frontendPlayerRoutes);
  app.use('/events', frontendEventRoutes);


  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
  app.use('/players', playerRoutes);
  app.use('/events', eventRoutes);
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
};
export default constructorMethod;