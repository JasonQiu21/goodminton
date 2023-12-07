import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

import {getEvent} from './data/events.js';
import {generateMatches} from './data/eventgeneration.js';

/*
TODO:
- Build out routes
*/

app.use(express.json());

configRoutes(app);

app.listen(3000, async () => {
    console.log(matches);

    console.log("Goodminton server running on http://localhost:3000");
});