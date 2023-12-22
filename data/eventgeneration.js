import * as typecheck from '../typecheck.js'
import { events, players } from "../config/mongoCollections.js";
import { getPlayer, updatePlayer } from "./players.js";
import { getEvent } from "./events.js";
import { ObjectId } from 'mongodb';

/*
HELPER FUNCTIONS GO HERE!
*/
function seeding(numPlayers) {
    /*
    NOTE: THIS FUNCTION WAS NOT WRITTEN BY US. IT WAS TAKEN FROM https://stackoverflow.com/questions/8355264/tournament-bracket-placement-algorithm
    (Just to credit who took this from online so that no one else gets blamed for this - Bryan was in charge of this)
    */
    function nextLayer(pls) {
        var out = [];
        var length = pls.length * 2 + 1;
        pls.forEach(function (d) {
            out.push(d);
            out.push(length - d);
        });
        return out;
    }

    var rounds = Math.log(numPlayers) / Math.log(2) - 1;
    var pls = [1, 2];
    for (var i = 0; i < rounds; i++) pls = nextLayer(pls);
    return pls;
}

export const createTeams = async (event, seeded = false) => {
    let players = event.reservations[0].players;

    for (let i = 0; i < players.length; i++) players[i] = [await getPlayer(players[i]._id.toString())];
    if (players.length < 2) throw { status: 400, error: "Not enough players to generate a tournament." };

    if (event.eventType == "singles tournament") {
        if (seeded) players = players.sort((a, b) => b[0].singlesRating - a[0].singlesRating);
        players = players.map(player => { return [{ _id: new ObjectId(player[0]._id), playerName: player[0].playerName }] });
    } else {
        let playerCopy = players
        for (let i = 0; i < playerCopy.length - 1; i += 2) {
            players[i / 2] = [playerCopy[i][0], playerCopy[i + 1][0]];
        }
        players = players.slice(0, players.length / 2);
        if (seeded) players = players.sort((a, b) => { return (b[0].doublesRating + b[1].doublesRating) - (a[0].doublesRating + a[1].doublesRating) });
        players = players.map(player => { return [{ _id: new ObjectId(player[0]._id), playerName: player[0].playerName }, { _id: new ObjectId(player[1]._id), playerName: player[1].playerName }] });
    }

    //this does the seeding process. at this point, seeded players will have already been sorted.
    let seededList = seeding(Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)))); //generates the proper seeding order
    while (players.length < seededList.length) players.push("bye"); //add byes to the end of the list

    let playersCopy = []
    for (let i = 0; i < players.length; i++) playersCopy.push(players[i]);

    for (let i = 0; i < players.length; i++) {
        players[i] = playersCopy[seededList[i] - 1];
    }

    //change the order of reservation so that the teams can be recreated normally at any time (even if the tournament is seeded)
    if (event.tournamentType == "single elim" || event.tournamentType == "double elim") {
        let reservation = [];
        for (let i = 0; i < players.length; i++) {
            if (players[i] !== "bye") {
                reservation.push({ _id: new ObjectId(players[i][0]._id.toString()), playerName: players[i][0].playerName });
                if (players[i][1]) reservation.push({ _id: new ObjectId(players[i][1]._id.toString()), playerName: players[i][1].playerName });
            }
        }

        const eventsCol = await events();
        const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { reservations: [{ time: event.reservations[0].time, players: reservation, max: event.reservations[0].max }] } });
        if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };
    }
    return players;
}

export const getTeamWins = (event, team) => {
    let wins = 0;
    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if ((match.team1 !== null || match.team2 !== null) && !match.byeround) {
                if (match.team1 !== null && (match.team1[0]._id.equals(team[0]._id) || (team.length > 1 && match.team1[1]._id.equals(team[1]._id)))) {
                    if (match.winner === 1) wins++;
                }
                if (match.team2 !== null && (match.team2[0]._id.equals(team[0]._id) || (team.length > 1 && match.team2[1]._id.equals(team[1]._id)))) {
                    if (match.winner === 2) wins++;
                }
            }
        }
    }

    return wins;
}

export const getTeamLosses = (event, team) => {
    let losses = 0;
    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if ((match.team1 !== null || match.team2 !== null) && !match.byeround) {
                if (match.team1 !== null && (match.team1[0]._id.equals(team[0]._id) || (team.length > 1 && match.team1[1]._id.equals(team[1]._id)))) {
                    if (match.winner === 2) losses++;
                }
                if (match.team2 !== null && (match.team2[0]._id.equals(team[0]._id) || (team.length > 1 && match.team2[1]._id.equals(team[1]._id)))) {
                    if (match.winner === 1) losses++;
                }
            }
        }
    }

    return losses;
}

export const getTeamScore = (event, team) => {
    let score = 0;
    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if (match.team1 !== null && match.team2 !== null) {
                if (match.team1[0].id === team[0].id || match.team1[0].id === team[1].id) {
                    score += match.score[0];
                } else if (match.team2[0].id === team[0].id || match.team2[0].id === team[1].id) {
                    score += match.score[1];
                }
            }
        }
    }

    return score;
}

export const playedBefore = (event, team1, team2) => {
    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if (match.team1 !== null && match.team2 !== null) {
                if ((match.team1[0]._id.toString() === team1[0]._id.toString() && match.team2[0]._id.toString() === team2[0]._id.toString())) return true;
            }
        }
    }

    return false;
}

export const getTournamentStandings = async (event) => {
    let standings = [];
    //first, we get all the teams
    let teams = await createTeams(event);
    teams = teams.sort((a, b) => {
        if (getTeamWins(event, a) === getTeamWins(event, b)) return getTeamScore(event, b) - getTeamScore(event, a);
        else return getTeamWins(event, b) - getTeamWins(event, a)
    });

    for (let i = 0; i < teams.length; i++) {
        standings.push({
            team: teams[i],
            wins: getTeamWins(event, teams[i]),
            losses: getTeamLosses(event, teams[i]),
        });
    }

    return standings;
}

/*
TOURNAMENT GENERATION FUNCTIONS GO HERE!
*/

export const generateRoundRobinTournament = async (event, seeded = false) => {

    let players = await createTeams(event);
    if (players.length < 2) throw { status: 400, error: "Not enough players to generate a round robin tournament." };

    const matches = {};
    const round = [];
    let matchcounter = 0;

    for (let i = 0; i < players.length; i++) {
        for (let j = i + 1; j < players.length; j++) {
            round.push({
                id: matchcounter + 1,
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
    return matches;
}

export const createSwissRound = async (event, seeded = false) => {
    //this swiss round generation follows the start.gg algorithm.
    let teams = await createTeams(event, seeded);

    if (teams.length < 2) throw { status: 400, error: "Not enough players to generate a swiss round." };

    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if (match.team1 !== null && match.team2 !== null) {
                if (match.winner === 0) throw { status: 400, error: "Previous rounds have not been completed yet." };
            }
        }
    }

    let matches = event.matches;

    let roundnumber = Object.keys(event.matches).length + 1;
    let matchnumber = 1 + Math.ceil(Object.keys(event.matches).length * teams.length / 2);
    let round = [];

    teams = teams.sort((a, b) => {
        if (getTeamWins(event, a) === getTeamWins(event, b)) return getTeamScore(event, b) - getTeamScore(event, a);
        else return getTeamWins(event, b) - getTeamWins(event, a)
    });

    if (teams.length % 2 === 1) teams.push("bye");


    while (teams.length > 0) {
        let team1 = teams[0];
        let counter = 0;

        let validTeam = false;

        while (!validTeam && counter < teams.length) {
            counter++;
            if (teams[counter] === "bye") break;
            validTeam = !playedBefore(team1, teams[counter]);
        }

        if (counter === teams.length) throw { status: 400, error: "Cannot generate any more rounds: rematches will be made." };

        round.push({
            id: matchnumber,
            team1: team1,
            team2: (teams[counter] === "bye") ? "bye" : teams[counter],
            score: [0, 0],
            winner: (teams[counter] == "bye") ? 1 : 0,
            byeround: (teams[counter] === "bye")
        });

        teams.splice(counter, 1);
        teams.splice(0, 1);
        matchnumber++;
    }

    matches[`swissround - ${roundnumber}`] = round;

    const eventsCol = await events();
    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { matches: matches } });

    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };

    return matches;
}

export const swissTopCut = async (event, topCut = 4) => {
    let teams = await createTeams(event);

    for (let round in event.matches) {
        for (let match of event.matches[round]) {
            if (match.team1 !== null && match.team2 !== null) {
                if (match.winner === 0) throw { status: 400, error: "Previous rounds have not been completed yet." };
            }
        }
    }

    teams = teams.sort((a, b) => {
        if (getTeamWins(event, a) === getTeamWins(event, b)) return getTeamScore(event, b) - getTeamScore(event, a);
        else return getTeamWins(event, b) - getTeamWins(event, a)
    });

    let fakeReservation = [];
    for (let i = 0; i < topCut; i++) {
        fakeReservation.push(teams[i][0]);
        if (teams[i][1]) fakeReservation.push(teams[i][1]);
    }

    const fakeEvent = {
        _id: event._id,
        eventType: event.eventType,
        tournamentType: "swiss",
        matches: event.matches,
        reservations: [{ time: event.reservations[0].time, players: fakeReservation, max: topCut }]
    }

    generateElimTournament(fakeEvent, true);

    return event.matches;
}

export const generateElimTournament = async (event, seeded = false) => {
    /*
    This function takes in the event and whether or not the event is seeded and generates an object with keys that have values of lists of matches
    */

    //skipping validation for now, but TODO? idk

    let players = await createTeams(event, seeded);

    //at this point, each index of players is a string (either "Person1" or "Person1 & Person2")
    let teamlength = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)));

    let matchcounter = 1 + Object.keys(event.matches).length * ((event.tournamentType === "swiss") ? event.matches["swissround - 1"].length : 0); //this multiplication is to allocate space for previously made swiss rounds if they have been made.
    let roundcounter;
    let roundnumber = 1;

    let matches = event.matches;

    if (event.tournamentType === "single elim" || event.tournamentType === "swiss") {
        //Generate the first round. This has to be uniquely done due to the nature of bye rounds.
        let roundnumber = 1;

        if (players.length < 2) throw { status: 400, error: "Not enough players to generate a single elimination tournament." };
        //Generate subsequent rounds.
        while (teamlength > 1) {
            let roundTitle = `winners - ${roundnumber}`;
            let round = []
            let roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 1) roundcounter++;
                round.push({
                    id: matchcounter,
                    team1: (roundnumber === 1) ? players[i * 2] : null,
                    team2: (roundnumber === 1) ? players[i * 2 + 1] : null,
                    score: [0, 0],
                    winner: ((players[i * 2] === "bye") ? 2 : (players[i * 2 + 1] === "bye") && roundnumber === 1) ? 1 : 0,
                    byeround: false,
                    winner_to: (teamlength === 2) ? null : roundcounter,
                    loser_to: null
                });
                matchcounter++;
            }

            matches[roundTitle] = round;
            teamlength /= 2;
            roundnumber++;
        }
    } else if (event.tournamentType === "double elim") {
        //Generate the first round. This has to be uniquely done due to the nature of bye rounds.
        let roundnumber = 1;
        let roundcounter = matchcounter + teamlength / 2 - 1;
        let bonuscounter = 0;

        if (players.length < 4) throw { status: 400, error: "Not enough players to generate a double elimination tournament." };
        if (players.length % 2 === 1) throw { status: 400, error: "Cannot generate a double elimination tournament with an odd number of players." };

        while (teamlength > 1) {
            let roundTitle = `winners - ${roundnumber}`;
            let round = [];
            roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 1) roundcounter++;
                round.push({
                    id: matchcounter,
                    team1: (roundnumber === 1) ? players[i * 2] : null,
                    team2: (roundnumber === 1) ? players[i * 2 + 1] : null,
                    score: [0, 0],
                    winner: (players[i * 2] === "bye") ? 2 : (players[i * 2 + 1] === "bye" && roundnumber === 1) ? 1 : 0,
                    byeround: false,
                    winner_to: (teamlength === 2) ? Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) * 2 - 2 : roundcounter,
                    loser_to: (roundnumber == 1) ? roundcounter - teamlength / 2 - 1 + Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) : i + bonuscounter + Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)))
                });

                matchcounter++;
            }
            //16 17 18 19 --> 0 --> 20 21 22 23 --> 3 --> 26 27 --> 1 --> 28 --> 1 --> 29
            matches[roundTitle] = round;
            bonuscounter += (roundnumber === 1) ? teamlength / 4 : teamlength / 2 + teamlength / 4;
            teamlength /= 2;
            roundnumber++;
        }

        teamlength = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) / 2; //do this again for losers bracket
        roundcounter = matchcounter + teamlength / 2 - 1;
        roundnumber = 1;

        while (teamlength > 1) {
            //now we create TWO rounds at a time, since it's n/2 --> n/2 --> n/4 --> n/4 -->  etc.
            let roundTitle = `losers - ${roundnumber}`;
            let round1 = [];

            let roundcounter = matchcounter + teamlength / 2 - 1;

            for (let i = 0; i < teamlength / 2; i++) {
                if (matchcounter % 2 === 0) roundcounter++;

                round1.push({
                    id: matchcounter,
                    team1: null,
                    team2: null,
                    score: [0, 0],
                    winner: (players[i] === "bye") ? 2 : (players[i + 1] === "bye") ? 1 : 0,
                    byeround: false,
                    winner_to: (teamlength === 2 && roundnumber % 2 === 0) ? Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) * 2 - 2 : (roundnumber % 2 == 1) ? roundcounter + i : roundcounter,
                    loser_to: null
                });
                matchcounter++;
            }

            matches[roundTitle] = round1;

            roundnumber++;
            if (roundnumber % 2 == 1) teamlength /= 2;
        }

        matches["finals"] = [{
            id: Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2))) * 2 - 2,
            team1: null,
            team2: null,
            score: [0, 0],
            winner: 0,
            byeround: false
        }]
    }

    //now we update bye rounds

    for (let round in matches) {
        for (let match of matches[round]) {
            if ((match.team1 === "bye" || match.team2 === "bye") && !match.byeround) {
                match.byeround = true;
                let result = await submitScoresForMatch(event, match.id, [0, 0], (match.team1 === "bye") ? 2 : 1, true);
            }
        }
    }


    const eventsCol = await events();
    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id.toString()) }, { $set: { matches: matches } });
    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };

    return matches;
}

export const translationElimBracketLayer = async (event) => {
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

export const submitScoresForMatch = async (event, matchId, score, winner, onGeneration = false) => {
    /*
    This function takes in the event ID, the match ID, the score, and the winner and updates the match with the score and winner.
    */

    score = typecheck.isNonEmptyArray(score);

    const matches = event.matches;


    //hoooooly crap now we have to UPDATE THIS SHIT
    for (let round in matches) {
        for (let match of matches[round]) {
            if (match.id === matchId) {
                if (match.winner !== 0 && !onGeneration) throw { status: 400, error: "Match is already recorded." };
                if (match.byeround && !onGeneration) throw { status: 400, error: "You cannot record a score for a bye round." };

                match.score = score;
                match.winner = winner;


                //update elos
                if (match.team1 !== null && match.team2 !== null && !match.byeround) {
                    let elo1 = 0, elo2 = 0;
                    let player1, player2, player3, player4;

                    if (event.eventType === "singles tournament") {
                        player1 = await getPlayer(match.team1[0]._id.toString());
                        player2 = await getPlayer(match.team2[0]._id.toString());
                        elo1 = player1.singlesRating;
                        elo2 = player2.singlesRating;
                    } else {
                        player1 = await getPlayer(match.team1[0]._id.toString());
                        player2 = await getPlayer(match.team1[1]._id.toString());
                        player3 = await getPlayer(match.team2[0]._id.toString());
                        player4 = await getPlayer(match.team2[1]._id.toString());
                        elo1 = (player1.doublesRating + player2.doublesRating) / 2;
                        elo2 = (player3.doublesRating + player4.doublesRating) / 2;
                    }

                    let diff = 12 * (1 - 1 / (1 + Math.pow(10, (Math.abs(elo2 - elo1)) / 480))); //ELO formula, k-score = 12
                    diff = Math.round(diff * 100) / 100;

                    if (diff > 0) {
                        if (match.winner === 1) {
                            if (event.eventType === "singles tournament") {
                                await updatePlayer(match.team1[0]._id.toString(), { singlesRating: player1.singlesRating + diff });
                                await updatePlayer(match.team2[0]._id.toString(), { singlesRating: player2.singlesRating - diff });
                            } else {
                                await updatePlayer(match.team1[0]._id.toString(), { doublesRating: player1.doublesRating + diff });
                                await updatePlayer(match.team1[1]._id.toString(), { doublesRating: player2.doublesRating + diff });
                                await updatePlayer(match.team2[0]._id.toString(), { doublesRating: player3.doublesRating - diff });
                                await updatePlayer(match.team2[1]._id.toString(), { doublesRating: player4.doublesRating - diff });
                            }
                        } else {
                            if (event.eventType === "singles tournament") {
                                await updatePlayer(match.team1[0]._id.toString(), { singlesRating: player1.singlesRating - diff });
                                await updatePlayer(match.team2[0]._id.toString(), { singlesRating: player2.singlesRating + diff });
                            } else {
                                await updatePlayer(match.team1[0]._id.toString(), { doublesRating: player1.doublesRating - diff });
                                await updatePlayer(match.team1[1]._id.toString(), { doublesRating: player2.doublesRating - diff });
                                await updatePlayer(match.team2[0]._id.toString(), { doublesRating: player3.doublesRating + diff });
                                await updatePlayer(match.team2[1]._id.toString(), { doublesRating: player4.doublesRating + diff });
                            }
                        }
                    }
                }

                //now we have to update the next match
                if (match.winner_to !== null) {
                    for (let round2 in matches) {
                        for (let match2 of matches[round2]) {
                            if (match2.id === match.winner_to) {
                                if (match2.team1 === null) {
                                    if (match.winner === 1) match2.team1 = match.team1;
                                    else match2.team1 = match.team2;
                                } else {
                                    if (match.winner === 1) match2.team2 = match.team1;
                                    else match2.team2 = match.team2;
                                }

                                if (match2.byeround) await submitScoresForMatch(event, match2.id, [0, 0], match2.winner, true);
                            }
                        }
                    }
                }

                if (match.loser_to !== null) {
                    for (let round2 in matches) {
                        for (let match2 of matches[round2]) {
                            if (match2.id === match.loser_to) {
                                if (match2.team1 === null) {
                                    if (match.winner === 2) match2.team1 = match.team1;
                                    else match2.team1 = match.team2;
                                } else {
                                    if (match.winner === 2) match2.team2 = match.team1;
                                    else match2.team2 = match.team2;
                                }

                                if (match2.byeround) await submitScoresForMatch(event, match2.id, [0, 0], match2.winner, true);
                            }
                        }
                    }
                }
            }
        }
    }

    event.matches = matches;
    const eventsCol = await events();

    const returnedUpdate = await eventsCol.updateOne({ _id: typecheck.stringToOid(event._id) }, { $set: { matches: matches } });


    if (!returnedUpdate.acknowledged) throw { status: 500, error: "An error occurred while updating event." };
    return event;
}

export const getMatchFromTournament = async (event, matchId) => {
    const matches = event.matches;

    for (let round in matches) {
        for (let match of matches[round]) {
            if (match.id === matchId) {
                let clonedMatch = JSON.parse(JSON.stringify(match));
                clonedMatch.in_round = round;
                return clonedMatch;
            }
        }
    }

    throw { status: 404, error: "No match with that ID found." };
}
