import * as typecheck from './typecheck.js'

export const generateMatches = (event) => {
    if(!event) throw { status: 400, error: "Event does not exist." };

    let players = event.reservations[0].players; //there is only one time slot for tournaments

    players = typecheck.isNonEmptyArray(players);

    if(event.eventType === "leaguenight") {

    } else if(event.eventType === "tournament") {
        
    }
}