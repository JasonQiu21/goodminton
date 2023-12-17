import playerRoutes from './players.js';
import eventRoutes from './events.js';

import displayPlayerRoutes from './frontend-players.js';
import displayEventRoutes from './frontend-events.js';

const constructorMethod = (app) => {
  app.use('/api/players', playerRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/players', displayPlayerRoutes);
  app.use('/events', displayEventRoutes);

  
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route Not found' });
  });
};
export default constructorMethod;