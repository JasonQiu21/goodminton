import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

/*
TODO:
- Build out routes
*/

app.use(express.json());

configRoutes(app);

app.listen(3000, () => {
    console.log("Goodminton server running on http://localhost:3000");
});