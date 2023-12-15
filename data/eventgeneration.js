import * as typecheck from './typecheck.js'
import { get } from './players.js';

export const generateMatches = async (event, tournamentType, seeded = true) => {
    /*
    This function takes in the event and whether or not the event is seeded and generates an object with keys that have values of lists of matches
    */

    
    //skipping validation for now, but TODO? idk

    let players = event.reservations[0].players;

    for(let i = 0; i < players.length; i++) players[i] = [await get(players[i]._id.toString())];

    if(event.teamType == "singles") {
        if(seeded) players = players.sort((a, b) => b[0].singlesRating - a[0].singlesRating);
        players = players.map(player => player[0].playerName);
    } else {
        let playerCopy = players
        for(let i = 0; i < playerCopy.length - 1; i += 2) {
            players[i / 2] = [playerCopy[i][0] , playerCopy[i + 1][0]];
        }
        players = players.slice(0, players.length / 2);
        if(seeded) players = players.sort((a, b) => (b[0].doublesRating + b[1].doublesRating) / 2 - (a[0].doublesRating + a[1].doublesRating) / 2);
        players = players.map(player => player[0].playerName + " & " + player[1].playerName);
    }


    //at this point, each index of players is a string (either "Person1" or "Person1 & Person2")
    let teamlength = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)));
    let teamlength1 = teamlength;

    let matchcounter = 1;

    let matches = {};

    if(tournamentType.name === "Single Elimination") {
        let roundTitle = `winners-${teamlength}`;
        let round = [];

        for(let i = 0; i < teamlength; i += 2) {
            console.log(i);
            if(i < teamlength - players.length) {
                round.push({
                    id: matchcounter,
                    team1: players[i],
                    team2: null,
                    score: [0, 0],
                    winner: 1,
                    byeround: true,
                    winner_to: matchcounter + Math.floor(teamlength / 2) - (i % 2),
                    loser_to: null
                })
            } else {
                round.push({
                    id: matchcounter,
                    team1: players[i],
                    team2: players[i+1],
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: matchcounter + Math.floor(teamlength / 2) - (i % 2),
                    loser_to: null
                })
            }

            if(i + 1 < teamlength - players.length) {
                round.push({
                    id: matchcounter + 1,
                    team1: players[i + 2],
                    team2: null,
                    score: [0, 0],
                    winner: 1,
                    byeround: true,
                    winner_to: matchcounter + Math.floor(teamlength / 2) - (i % 2),
                    loser_to: null
                })
            } else {
                round.push({
                    id: matchcounter + 1,
                    team1: players[i + 2],
                    team2: players[i + 3],
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: matchcounter + Math.floor(teamlength / 2) - (i % 2),
                    loser_to: null
                })
            }

    
            matchcounter += 2;
        }
        

        matches[roundTitle] = round;
        teamlength /= 2;


        while(teamlength > 1) {
            let roundTitle = `winners-${teamlength}`;
            let round = []
            
            for(let i = 0; i < teamlength / 2; i++) {
                round.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: matchcounter + (teamlength / 2),
                    loser_to: null
                })
                matchcounter++;
            }

            matches[roundTitle] = round;
            teamlength /= 2;
        }
    } else if(tournamentType.name === "Double Elimination") {
        let roundTitle = `winners-${teamlength}`;
        let round = [];

        for(let i = 0; i < teamlength - players.length; i++) {
            round.push({
                id: matchcounter,
                team1: players[i],
                team2: null,
                score: [0, 0],
                winner: 1,
                byeround: true,
                winner_to: matchcounter + teamlength / 2,
                loser_to: matchcounter + teamlength - 1
            })
            matchcounter++;
        }

        for(let i = teamlength - players.length; i < players.length; i += 2) {
            round.push({
                id: matchcounter,
                team1: players[i],
                team2: players[i+1],
                score: [0, 0],
                winner: 0,
                byeround: false,
                winner_to: matchcounter + teamlength / 2,
                loser_to: matchcounter + teamlength
            })
            matchcounter++;
        }
        

        matches[roundTitle] = round;
        teamlength /= 2;
        teamlength1 /= 2;

        while(teamlength > 1) {
            let roundTitle = `winners-${teamlength}`;
            let round = []
            
            for(let i = 0; i < teamlength / 2; i++) {
                round.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: matchcounter + teamlength / 2,
                    loser_to: matchcounter + teamlength
                });
                matchcounter++;
            }

            matches[roundTitle] = round;
            teamlength /= 2;
        }

        while(teamlength1 > 1) {
            let roundTitle = `losers-${teamlength1}`;
            let round = []
            
            for(let i = 0; i < teamlength1 / 2; i++) {
                round.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: 0,
                    byeround: false,
                    winner_to: matchcounter + teamlength / 2,
                    loser_to: null
                });
                matchcounter++;
            }
            matches[roundTitle] = round;
            teamlength1 /= 2;
        }

        roundTitle = `finals`;
        round = [{
            id: matchcounter,
            team1: null,
            team2: null,
            score: [0, 0],
            winner: 0,
            byeround: false,
        }];
        matches[roundTitle] = round;
    }

    return matches;
}

export const setMatchScore = async (eventId, matchId, score) => {

}