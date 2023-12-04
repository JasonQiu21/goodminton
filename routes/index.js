import playerRoutes from './players.js';
const constructorMethod = (app) => {
    app.use('/players', playerRoutes);
    app.use('*', (req, res) => {
        res.status(404).json({error: 'Route Not found'});
    });
};
export default constructorMethod;