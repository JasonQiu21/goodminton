import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

import { getEvent } from './data/events.js'
import { generateElimTournament, translationBracketLayer } from './data/eventgeneration.js'

/*
TODO:
- Build out routes
*/

app.use(express.json());

configRoutes(app);

app.listen(3000, async () => {
    const matches = await generateElimTournament('657cc85551885368ed83d995', { name: "Double Elimination" }, false);
    //console.log(JSON.stringify(matches, null, 4));
    const translation = await translationBracketLayer('657cc85551885368ed83d995');
    //console.log(translation);
    console.log("Goodminton server running on http://localhost:3000");
});