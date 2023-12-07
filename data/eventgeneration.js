import * as typecheck from './typecheck.js'
import { get } from './players.js';

export const generateMatches = async (event, seeded = true) => {
    /*
    This function takes in the event and whether or not the event is seeded and generates an object with keys that have values of lists of matches
    */

    
    //skipping validation for now, but TODO? idk

    let players = event.reservations[0].players;

    if(event.teamType == "singles") {
        for(let i = 0; i < players.length; i++) players[i] = [await get(players[i]._id.toString())];
        if(seeded) players = players.sort((a, b) => b[0].singlesRating - a[0].singlesRating);
    } else {
        let playerCopy = players;
        for(let i = 0; i < playerCopy.length - 1; i+=2) players[i / 2] = [playerCopy[i], playerCopy[i + 1]];
        players = players.slice(0, players.length / 2);
    }


    return players;



    //players is now a list of full players
    

    

}
