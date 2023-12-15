import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

import {getEvent} from './data/events.js'
import {generateMatches} from './data/eventgeneration.js'

/*
TODO:
- Build out routes
*/

app.use(express.json());

configRoutes(app);

app.listen(3000, async () => {

    const event = await getEvent('657a6c37dfa162a30ff80ea0');
    const matches = await generateMatches(event, {name: "Single Elimination"});

    console.log(matches);
    console.log("Goodminton server running on http://localhost:3000");
});