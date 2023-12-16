import express from 'express';
const app = express();
import configRoutes from './routes/index.js';

import { getEvent } from './data/events.js'
import { generateElimTournament, generateRoundRobinTournament, generateSwissRound } from './data/eventgeneration.js'

/*
TODO:
- Build out routes
*/

app.use(express.json());

configRoutes(app);

/*
app.listen(3000, async () => {
    try {
        const matches = await generateElimTournament('657dac3f4067c86744de0a7e', false);
        //console.log(JSON.stringify(matches, null, 4));
        const translation = await translationBracketLayer('657cc85551885368ed83d995');
        //console.log(translation);
    } catch (e) {
        console.log(e);
    }
    console.log("Goodminton server running on http://localhost:3000");
});
*/

try {
    const id = '657db7917287dcf4e53999f8';
    const matches = await generateSwissRound(id, true);
} catch (e) {
    console.log(e);
}