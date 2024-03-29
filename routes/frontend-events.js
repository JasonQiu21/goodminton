import { Router } from "express";
import * as typecheck from "../typecheck.js";
import { getReservations } from "../data/players.js";
import { time } from "console";

import {
	createEvent,
	getAllEvents,
	getEvent,
	updateEvent,
	deleteEvent,
	createReservation,
	deleteReservation,
	startTournament,
	generateSwissRound,
	topCut,
	getMatch,
	getStandings,
	submitScores,
} from "../data/events.js";

const router = Router();

router.route("/").get(async (req, res) => {
	try {
		return res.render("allEvents", {
			title: "All Events",
			user: req.session?.player,
			id: req.session?.player?._id,
			isAdmin: req.session?.player?.role === "admin",
		});
	} catch (e) {
		return res.status(400).render("error", {
			user: req.session?.player,
			id: req.session?.player?._id,
			isAdmin: req.session?.player?.role === "admin",
			error: (e.status) ? e.error : "An uncaught error has occured. Please contact the developers!"
		});
	}
})

/* getReservations(playerId)
[
  {
	_id: '657e45b9d6da26c30fd41289',
	name: '11/28/2023 Practice',
	time: 1701207000
  }
]
*/

router.route("/:id").get(async (req, res) => {
	try {
		const event = await getEvent(req.params.id);
		const isLoggedIn = req.session?.player ? true : false;
		const timeStamp = event.reservations[0].time;

		if (event?.tournamentType) {

			//get the unfinished matches for scorekeeping
			let unfinishedMatches = [];

			for (let round in event.matches) {
				for (let match1 of event.matches[round]) {
					if (match1.winner === 0 && !match1.byeround && match1.team1 !== null && match1.team2 !== null) {
						let match2 = JSON.parse(JSON.stringify(match1));
						match2.team1 = (match1.team1.length > 1) ? match1.team1[0].playerName + " & " + match1.team1[1].playerName : match1.team1[0].playerName;
						match2.team2 = (match1.team2.length > 1) ? match1.team2[0].playerName + " & " + match1.team2[1].playerName : match1.team2[0].playerName;
						match2.in_round = round;
						unfinishedMatches.push(match2);
					}
				}
			}

			event.tournamentType = event.tournamentType.toLowerCase();
			let inTimeslot = false;
			if (isLoggedIn) {
				event.reservations[0].players.forEach((player) => {
					if (player._id.toString() === req.session?.player?._id) {
						inTimeslot = true;
					}
				});
			}

			if (event?.tournamentType === "round robin") {
				return res.render("roundrobin", {
					title: event.name,
					event: event,
					user: req.session?.player,
					id: req.session?.player?._id,
					isAdmin: req.session?.player?.role === "admin",
					loggedIn: isLoggedIn,
					timeStamp: timeStamp,
					inTimeslot: inTimeslot,
					eventId: req.params.id,
					displayJoinButton: Object.keys(event.matches).length === 0,
					reservation: event.reservations[0],
					matchData: unfinishedMatches
				});
			} else if (event?.tournamentType === "swiss") {
				let swissrounds = {};
				let singleElim = {};
				for (let match of Object.keys(event.matches)) {
					if (match.includes('swissround')) swissrounds[match] = event.matches[match];
					else if (match.includes('winners')) singleElim[match] = event.matches[match];
				}
				// event.matches = swissrounds;
				// const onlySwiss = event;
				const displayJoinButton = Object.keys(event.matches).length === 0;
				event.matches = singleElim;


				return res.render("swiss", {
					title: event.name,
					event: event,
					user: req.session?.player,
					id: req.session?.player?._id,
					isAdmin: req.session?.player?.role === "admin",
					loggedIn: isLoggedIn,
					timeStamp: timeStamp,
					inTimeslot: inTimeslot,
					eventId: req.params.id,
					displayJoinButton: displayJoinButton,
					reservation: event.reservations[0],
					matchData: unfinishedMatches
				});
			} else if (event?.tournamentType === "single elim") {
				for (let round in event.matches) {
					for (let matchIndex of event.matches[round]) {
						if (matchIndex.winner == 1) {
							matchIndex.winner1 = true;
							matchIndex.winner2 = false;
						} else if (matchIndex.winner == 2) {
							matchIndex.winner1 = false;
							matchIndex.winner2 = true;
						}
					}
				}

				return res.render("singleElim", {
					event: event,
					title: event.name,
					user: req.session?.player,
					id: req.session?.player?._id,
					isAdmin: req.session?.player?.role === "admin",
					loggedIn: isLoggedIn,
					timeStamp: timeStamp,
					inTimeslot: inTimeslot,
					eventId: req.params.id,
					displayJoinButton: Object.keys(event.matches).length === 0,
					reservation: event.reservations[0],
					matchData: unfinishedMatches
				});
			} else if (event?.tournamentType === "double elim") {
				let winnerBracket = {};
				let loserBracket = {};
				for (let round in event.matches) {
					if (round.includes("winners") || round.includes("finals")) {
						winnerBracket[round] = event.matches[round];
					} else {
						loserBracket[round] = event.matches[round];
					}
					for (let matchIndex of event.matches[round]) {
						if (matchIndex.winner == 1) {
							matchIndex.winner1 = true;
							matchIndex.winner2 = false;
						} else if (matchIndex.winner == 2) {
							matchIndex.winner1 = false;
							matchIndex.winner2 = true;
						}
					}
				}

				event.winnerBracket = winnerBracket;
				event.loserBracket = loserBracket;
				return res.render("doubleElim", {
					event: event,
					title: event.name,
					user: req.session?.player,
					id: req.session?.player?._id,
					isAdmin: req.session?.player?.role === "admin",
					loggedIn: isLoggedIn,
					timeStamp: timeStamp,
					inTimeslot: inTimeslot,
					eventId: req.params.id,
					displayJoinButton: Object.keys(event.matches).length === 0,
					reservation: event.reservations[0],
					matchData: unfinishedMatches
				});
			}
		} else {
			var playerReservations = [];

			try {
				if (req.session?.player) {
					playerReservations = await getReservations(req.session?.player?._id);
				}
			} catch (e) {
				if (e?.status !== 404) throw e;
			}

			let inEvent = playerReservations.some(
				(event) => event._id === req.params.id
			);

			var inEventTime = -1;

			if (inEvent) {
				inEventTime = playerReservations.filter(
					(event) => event._id === req.params.id
				)[0].time;
			}
			if (!isLoggedIn) {
				inEvent = true;
			}

			const eventDate = new Date(event.date * 1000);
			event.date = eventDate.toDateString();
			event.time = eventDate.toTimeString();
			for (let i = 0; i < event.reservations.length; i++) {
				const reservationTime = new Date(event.reservations[i].time * 1000);
				event.reservations[i].timeStamp = event.reservations[i].time;
				event.reservations[i].inEvent = inEvent;
				if (event.reservations[i].time === inEventTime) {
					// might need to multiply by 1000
					event.reservations[i].inTimeslot = true;
				} else {
					event.reservations[i].inTimeslot = false;
				}
				event.reservations[i].date = reservationTime.toDateString();
				event.reservations[i].timeStamped = reservationTime.toTimeString();
				event.reservations[i].isFull =
					event.reservations[i].players.length === event.reservations[i].max;
			}
			event.title = event.name;
			event.user = req.session?.player;
			event.id = req.session?.player?._id;
			event.isAdmin = req.session?.player?.role === "admin";
			event.isPractice = true;

			return res.render("practice", event);


		}
	} catch (e) {
		return res.status(400).render("error", {
			user: req.session?.player,
			id: req.session?.player?._id,
			isAdmin: req.session?.player?.role === "admin",
			error: (e.status) ? e.error : "An uncaught error has occured. Please contact the developers!"
		});
	}
});

export default router;
