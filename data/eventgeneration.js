import * as typecheck from './typecheck.js'
import { get } from './players.js';
import { events } from "../config/mongoCollections.js";
import { getEvent } from "./events.js";

export const createTeams = async (players) => {
    for (let i = 0; i < players.length; i++) players[i] = [await get(players[i]._id.toString())];

    if (event.teamType == "singles") {
        players = players.map(player => { return [{ id: player[0]._id, playerName: player[0].playerName }] });
    } else {
        let playerCopy = players
        for (let i = 0; i < playerCopy.length - 1; i += 2) {
            players[i / 2] = [playerCopy[i][0], playerCopy[i + 1][0]];
        }
        players = players.slice(0, players.length / 2);
        players = players.map(player => { return [{ id: player[0]._id, playerName: player[0].playerName }, { id: player[1]._id, playerName: player[1].playerName }] });
    }

    return players;
}

export const generateRoundRobinTournament = async (eventId) => {
    eventId = typecheck.stringToOid(eventId);
    const event = await getEvent(eventId.toString());

    let players = createTeams(event.reservations[0].players);

    const matches = {};
    const round = [];
    let matchcounter = 0;

    for (let i = 0; i < players.length; i++) {
        for (let j = i; j < players.length; j++) {
            round.push({
                id: matchcounter,
                team1: players[i],
                team2: players[j],
                score: [0, 0],
                winner: 0,
                byeround: false,
                winner_to: null,
                loser_to: null
            })

            matchcounter++;
        }
    }

    matches["round"] = round;

    const eventsCol = await events();
    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { matches: matches } });

    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };

}

export const generateSwissRound = async (event) => {

}

export const generateElimTournament = async (eventId, tournamentType, seeded = true) => {
    /*
    This function takes in the event and whether or not the event is seeded and generates an object with keys that have values of lists of matches
    */

    //skipping validation for now, but TODO? idk
    eventId = typecheck.stringToOid(eventId);
    const event = await getEvent(eventId.toString());

    let players = createTeams(event.reservations[0].players);

    //at this point, each index of players is a string (either "Person1" or "Person1 & Person2")
    let teamlength = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)));

    let matchcounter = 1;
    let roundcounter;

    let matches = {};

    if (tournamentType.name === "Single Elimination") {
        //Generate the first round. This has to be uniquely done due to the nature of bye rounds.
        let roundTitle = `winners-${teamlength}`;
        let round = [];
        roundcounter = matchcounter + teamlength / 2 - 1;

        for (let i = 0; i < players.length; i += 2) {
            if (matchcounter % 2 === 1) roundcounter++;
            round.push({
                id: matchcounter,
                team1: players[i],
                team2: (i < teamlength - players.length) ? null : players[i + 1],
                score: [0, 0],
                winner: 0,
                byeround: (i < teamlength - players.length),
                winner_to: roundcounter,
                loser_to: null
            });

            if (i < teamlength - players.length) i--;
            matchcounter++;
        }


        matches[roundTitle] = round;
        teamlength /= 2;

        //Generate subsequent rounds.
        while (teamlength > 1) {
            let roundTitle = `winners-${teamlength}`;
            let round = []
            let roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 1) roundcounter++;
                round.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: (teamlength === 2) ? null : roundcounter,
                    loser_to: null
                });
                matchcounter++;
            }

            matches[roundTitle] = round;
            teamlength /= 2;
        }
    } else if (tournamentType.name === "Double Elimination") {
        //Generate the first round. This has to be uniquely done due to the nature of bye rounds.
        let roundTitle = `winners-${teamlength}`;
        let round = [];
        roundcounter = matchcounter + teamlength / 2 - 1;

        for (let i = 0; i < players.length; i += 2) {
            if (matchcounter % 2 === 1) roundcounter++;
            round.push({
                id: matchcounter,
                team1: players[i],
                team2: (i < teamlength - players.length) ? null : players[i + 1],
                score: [0, 0],
                winner: 0,
                byeround: (i < teamlength - players.length),
                winner_to: roundcounter,
                loser_to: roundcounter - (teamlength / 2) - 1 + Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)))
            });

            if (i < teamlength - players.length) i--;
            matchcounter++;
        }

        matches[roundTitle] = round;
        teamlength /= 2;

        while (teamlength > 1) {
            let roundTitle = `winners-${teamlength}`;
            let round = [];

            let roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 1) roundcounter++;
                round.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: (teamlength === 2) ? Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) * 2 - 2 : roundcounter,
                    loser_to: (matchcounter) - (teamlength / 2) - 1 + Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)))
                });

                matchcounter++;
            }

            matches[roundTitle] = round;
            teamlength /= 2;
        }

        teamlength = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) / 2; //do this again for losers bracket
        while (teamlength > 1) {
            //now we create TWO rounds at a time, since it's n/2 --> n/2 --> n/4 --> n/4 -->  etc.
            let roundTitle1 = `losers-${teamlength}-1`;
            let roundTitle2 = `losers-${teamlength}-2`;
            let round1 = [];
            let round2 = [];

            let roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 1) roundcounter++;

                round1.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: roundcounter + 1,
                    loser_to: null
                });

                round2.push({
                    id: matchcounter + teamlength / 2,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: roundcounter + teamlength / 2 + 1,
                    loser_to: null
                });
                matchcounter++;
            }

            matchcounter += teamlength / 2;
            matches[roundTitle1] = round1;
            matches[roundTitle2] = round2;
            teamlength /= 2;
        }
    }

    const eventsCol = await events();
    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { matches: matches } });

    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };


    //now we update bye rounds
    for (let round in matches) {
        for (let match of matches[round]) {
            if (match.byeround) {
                let result = await submitScores(eventId.toString(), match.id, [0, 0], 1);
            }
        }
    }

    return returnedUpdate;
}

export const translationBracketLayer = async (eventId) => {
    eventId = typecheck.stringToOid(eventId);
    const event = await getEvent(eventId.toString());

    const matches = event.matches;

    let matchArray = [];
    for (let round in matches) {
        let roundArray = [];
        for (let match of matches[round]) {
            //get each player or something i guess
            roundArray.push({
                name: (match.team1 === null) ? "null" : match.team1[0].playerName + ((match.team1.length > 1) ? " & " + match.team1[1].playerName : ""),
                score: match.score[0],
                "byeround?": match.byeround,
                "winner?": match.winner === 1 || (match.byeround && match.team2 === null)
            });
            roundArray.push({
                name: (match.team2 === null) ? "null" : match.team2[0].playerName + ((match.team2.length > 1) ? " & " + match.team2[1].playerName : ""),
                score: match.score[1],
                "byeround?": match.byeround,
                "winner?": match.winner === 2 || (match.byeround && match.team1 === null)
            });
        }
        matchArray.push(roundArray);
    }

    return matchArray;

}

export const submitScores = async (eventId, matchId, score, winner) => {
    /*
    This function takes in the event ID, the match ID, the score, and the winner and updates the match with the score and winner.
    */

    eventId = typecheck.stringToOid(eventId);
    score = typecheck.isNonEmptyArray(score);

    const event = await getEvent(eventId.toString());

    const matches = event.matches;

    for (let round in matches) {
        for (let match of matches[round]) {
            if (match.id === matchId) {
                match.score = score;
                match.winner = winner;

                //now we have to update the next match
                if (match.winner_to !== null) {
                    for (let round2 in matches) {
                        for (let match2 of matches[round2]) {
                            if (match2.id === match.winner_to) {
                                if (match2.team1 === null) match2.team1 = match.team1;
                                else match2.team2 = match.team1;
                            }
                        }
                    }
                }

                if (match.loser_to !== null) {
                    for (let round2 in matches) {
                        for (let match2 of matches[round2]) {
                            if (match2.id === match.loser_to) {
                                if (match2.team1 === null) match2.team1 = match.team2;
                                else match2.team2 = match.team2;
                            }
                        }
                    }
                }
            }
        }
    }

    const eventsCol = await events();
    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { matches: matches } });


    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };
    return returnedUpdate;
}

