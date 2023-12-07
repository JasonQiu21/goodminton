import playerRoutes from './players.js';
import eventRoutes from './events.js';
import playerRoutes from './players.js';
import eventRoutes from './events.js';

const constructorMethod = (app) => {
  app.use('/players', playerRoutes);
  app.use('/events', eventRoutes);
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