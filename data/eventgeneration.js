import * as typecheck from './typecheck.js'
import { get } from './players.js';

export const generateMatches = async (event, tournamentType, seeded = true) => {
    /*
    This function takes in the event and whether or not the event is seeded and generates an object with keys that have values of lists of matches
    */


    //skipping validation for now, but TODO? idk

    let players = event.reservations[0].players;

    for (let i = 0; i < players.length; i++) players[i] = [await get(players[i]._id.toString())];

    if (event.teamType == "singles") {
        if (seeded) players = players.sort((a, b) => b[0].singlesRating - a[0].singlesRating);
        players = players.map(player => { return [{ id: player[0]._id, playerName: player[0].playerName }] });
    } else {
        let playerCopy = players
        for (let i = 0; i < playerCopy.length - 1; i += 2) {
            players[i / 2] = [playerCopy[i][0], playerCopy[i + 1][0]];
        }
        players = players.slice(0, players.length / 2);
        if (seeded) players = players.sort((a, b) => (b[0].doublesRating + b[1].doublesRating) / 2 - (a[0].doublesRating + a[1].doublesRating) / 2);
        players = players.map(player => { return [{ id: player[0]._id, playerName: player[0].playerName }, { id: player[1]._id, playerName: player[1].playerName }] });
    }


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

            round1.push({
                id: matchcounter,
                team1: null,
                team2: null,
                score: [0, 0],
                winner: 0,
                byeround: false,
                winner_to: roundcounter,
                loser_to: null
            });

            round2.push({
                id: matchcounter + teamlength,
                team1: null,
                team2: null,
                score: [0, 0],
                winner: 0,
                byeround: false,
                winner_to: roundcounter + teamlength,
                loser_to: null
            });

            matches[roundTitle1] = round1;
            matches[roundTitle2] = round2;
            teamlength /= 2;
        }
    }

    return matches;
}

export const setMatchScore = async (eventId, matchId, score) => {

}