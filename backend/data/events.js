import * as typecheck from "../typecheck.js";
import { events, players } from "../config/mongoCollections.js";
import * as playerFunctions from "./players.js";
import { generateElimTournament, submitScoresForMatch, swissTopCut, createSwissRound, generateRoundRobinTournament, getTournamentStandings, getMatchFromTournament } from "./eventgeneration.js";

const eventTypes = ["singles tournament", "doubles tournament", "practice"];

export const createEvent = async (
	eventName,
	eventDate,
	eventType,
	tournamentType = null,
	eventCap = 30
) => {
	const eventsCol = await events();
	//input validation
	eventName = typecheck.isValidString(eventName, "Event Name");
	eventDate = typecheck.isValidUnix(eventDate);
	eventType = typecheck.isValidString(eventType, "Event Type").toLowerCase();
	eventCap = typecheck.isFiniteNumber(eventCap, "Reservation Max");

	if (!eventTypes.includes(eventType))
		throw { status: 400, error: "Invalid event type." };

	if (eventType.toLowerCase().includes("tournament")) {
		tournamentType = typecheck.isValidString(tournamentType, "Tournament Type");
		if (
			tournamentType.toLowerCase() !== "none" &&
			tournamentType.toLowerCase() !== "single elim" &&
			tournamentType.toLowerCase() !== "double elim" &&
			tournamentType.toLowerCase() !== "round robin" &&
			tournamentType.toLowerCase() !== "swiss"
		) throw { status: 400, error: "Invalid tournament type." };
	}
	//in this case, reservations need to be made
	let reservations = [];
	if (eventType === "practice") for (let i = 0; i < 4; i++) reservations.push({ time: eventDate + 1800 * i, players: [], max: eventCap })
	else reservations.push({ time: eventDate, players: [], max: eventCap });

	try {
		var { acknowledged, insertedId } = await eventsCol.insertOne({
			name: eventName,
			date: eventDate,
			eventType: eventType,
			tournamentType: tournamentType,
			matches: eventType === "practice" ? null : {},
			reservations: reservations,
		});
		if (!acknowledged)
			throw { status: 500, error: "An error occurred while creating event" };
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "An error occurred while creating event" };
	}

	if (!acknowledged || !insertedId) throw { status: 500, error: "Error while creating event!" };

	return await getEvent(insertedId.toString());
};

export const getAllEvents = async () => {
	const eventsCol = await events();
	let res;
	try {
		res = await eventsCol.find({}).project({ _id: 1, name: 1, date: 1 }).toArray();
		return res;
	} catch (e) { throw { status: 500, error: "Error getting data!" }; }

};

export const getEvent = async (eventId) => {
	eventId = typecheck.stringToOid(eventId);
	const eventsCol = await events();
	let res, playerName;
	try {
		res = await eventsCol.findOne({ _id: eventId });
		for (let i in res.reservations) {
			for (let j in res.reservations[i].players) {
				playerName = await playerFunctions.getPlayer(
					res.reservations[i].players[j]._id.toString()
				);
				if (!playerName.playerName)
					throw { status: 404, error: "Error getting player name" };
				res.reservations[i].players[j].playerName = playerName.playerName;
			}
		}
	} catch (e) {
		throw { status: 500, error: `Error while getting event ${eventId}` };
	}
	try {
		res = typecheck.isNonEmptyObject(res);
	} catch (e) {
		throw { status: 404, error: `Event not found` };
	}
	res._id = res._id.toString();
	return res;
};

export const updateEvent = async (eventId, updatedEvent) => {
	/*
		updatedEvent is the fields of the event to updeate; so, if we had an event with 
		{ id: 1, name: asdf, ... } and changed it to { id: 1, name: jkl;, .... }
		we'd supply
		eventId: 1, updatedEvent: { name: jkl; } 
		*/
	let eventOid = typecheck.stringToOid(eventId);
	const eventsCol = await events();
	let event = await getEvent(eventId);
	updatedEvent = typecheck.isNonEmptyObject(updatedEvent, "Event Updates");
	Object.keys(updatedEvent).forEach((key) => {
		event[key] = updatedEvent[key];
	});
	// Now we know that (event - updatedEvent) union (updatedEvent) is a valid event; that is, updatedEvent is a valid partial event
	delete event.matches;
	delete event.reservations;
	event = typecheck.isValidEvent(event);
	try {
		delete updatedEvent?._id;
		var { matchedCount, modifiedCount } = await eventsCol.updateOne(
			{ _id: eventOid },
			{ $set: updatedEvent }
		);
	} catch (e) {
		console.log(e);
		throw { status: 500, error: `Error while updating ${eventId}` };
	}
	if (matchedCount === 0) throw { status: 404, error: "Event not found" };
	else if (matchedCount !== 1) {
		console.log(
			`<ERROR> found ${matchedCount} documents with same ObjectID. eventId: ${eventId}`
		);
		throw { status: 500, error: `Error while updating ${eventId}` };
	}
	if (modifiedCount == 0)
		throw { status: 400, error: "Event not updated - no changes were given" };
	if (modifiedCount !== 1)
		throw { status: 500, error: `Error while updating ${eventId}` };

	return await getEvent(eventId);
};

export const deleteEvent = async (eventId) => {
	const objectId = typecheck.stringToOid(eventId);
	const eventsCol = await events();
	let event = await getEvent(eventId);
	let res;
	try {
		res = await eventsCol.findOneAndDelete({ _id: objectId });
	} catch (e) {
		console.log(e);
		throw { status: 500, error: `Error while removing ${eventId}` };
	}

	try {
		res = typecheck.isNonEmptyObject(res);
	} catch (e) {
		throw {
			errorCode: 404,
			message: `Could not delete event with id '${objectId.toString()}'`,
		};
	}

	return { event: res, deleted: true };
};

export const createReservation = async (playerId, eventId, time) => {
	if (!playerId || !eventId)
		throw { status: 400, error: "PlayerID or EventID missing" };
	const eventCollection = await events();
	let playerOid = typecheck.stringToOid(playerId);
	let eventOid = typecheck.stringToOid(eventId);
	if (!time) throw { status: 400, error: "Need time" };
	time = typecheck.isValidUnix(time);

	let player = await playerFunctions.getPlayer(playerId);
	let playerInfo = {
		_id: typecheck.stringToOid(player._id),
		playerName: player.playerName,
	};
	let eventInfo = await getEvent(eventId);

	try {
		playerInfo = typecheck.isNonEmptyObject(playerInfo);
	} catch (e) {
		throw { status: 404, error: "Player not found" };
	}

	try {
		let existingReservations = await playerFunctions.getReservations(playerId);
		existingReservations.forEach((reservation) => {
			if (reservation._id === eventId)
				throw { status: 400, error: "Already reserved for this event" };
		});
	} catch (e) {
		if (e?.status !== 404) throw e;
	}

	try {
		eventInfo = typecheck.isNonEmptyObject(eventInfo);
	} catch (e) {
		throw { status: 404, error: "Event not found" };
	}
	const event = await eventCollection.findOne({
		_id: eventOid,
		"reservations.time": time,
	});
	if (!event) throw { status: 404, error: "No matching time and event" };
	try {
		var { reservations } = await eventCollection.findOne(
			{ _id: eventOid, "reservations.time": time },
			{ projection: { _id: 0, "reservations.$": 1 } }
		);
		// console.log(reservations);
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "Internal Server Error" };
	}

	if (reservations) {
		if (reservations[0].players.length >= reservations[0].max)
			throw { status: 500, error: "Courts are full for the provided time." };
		let info;
		info = await eventCollection
			.find({ _id: eventOid, "reservations.players._id": playerOid })
			.toArray();
		if (!info) throw { status: 404, error: "Player already reserved" };
		try {
			info = await eventCollection.updateOne(
				{ _id: eventOid },
				{ $addToSet: { "reservations.$[timeslot].players": playerInfo } },
				{ arrayFilters: [{ "timeslot.time": time }] }
			);

			//   db.events.updateOne({_id: ObjectId("657e1b338e10cb1db4fbee0c")}, {$push: {"reservations.$[timeslot].players": {_id: ObjectId("657e1b308e10cb1db4fbee0a")}}}, {arrayFilters: [ {"timeslot.time": 1701207000}]})
		} catch (e) {
			console.log(e);
			throw { status: 500, error: "Internal Server Error" };
		}

		if (!info.acknowledged)
			throw { status: 500, error: "Could not add reservation" };
		if (info?.modifiedCount == 0)
			throw { status: 400, error: "Event not updated - already reserved" };
		if (info?.modifiedCount !== 1)
			throw { status: 500, error: `Error while updating ${eventId}` };
		return {
			player: playerInfo.playerName,
			event: eventInfo.name,
			created: true,
		};
	} else {
		throw {
			error: 400,
			status: "There is no slot matching the time and event given.",
		};
	}
};

export const deleteReservation = async (playerId, eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	const playerOID = typecheck.stringToOid(playerId);
	const eventCollection = await events();
	let playerInfo = await playerFunctions.getPlayer(playerId);
	if (!playerInfo) throw { status: 404, error: "Could not find player" };
	let info;
	try {
		info = await eventCollection.findOne({ _id: eventOID });
		// console.log(info);
		info = await eventCollection.updateOne(
			{ _id: eventOID, "reservations.players._id": playerOID },
			{ $pull: { "reservations.$.players": { _id: playerOID } } }
		);
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "An Internal Server Error Occurred" };
	}
	if (!info) throw { status: 500, error: "Could not delete reservation" };
	if (!info.acknowledged)
		throw { status: 500, error: "Could not delete reservation" };
	if (info?.modifiedCount == 0)
		throw { status: 400, error: "No reservation to delete" };
	if (info?.modifiedCount !== 1)
		throw { status: 500, error: `Error while updating ${eventId}` };
	return info;
};

export const startTournament = async (eventId, seeded) => {
	const eventOID = typecheck.stringToOid(eventId);
	let event = await getEvent(eventId);

	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };

	if (Object.keys(event.matches) > 0 && event.tournamentType !== "swiss")
		throw { status: 400, error: "Tournament has already been generated." };
	//now we actually generate the brackets!
	if (
		event.tournamentType === "single elim" ||
		event.tournamentType === "double elim"
	)
		event.matches = await generateElimTournament(event, seeded);
	else if (event.tournamentType === "round robin")
		event.matches = await generateRoundRobinTournament(event, seeded);
	else throw { status: 400, error: "Invalid tournament type." };

	return event;
};

export const generateSwissRound = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	let event = await getEvent(eventId);
	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };
	if (event.tournamentType !== "swiss")
		throw { status: 400, error: "Event is not a Swiss Tournament." };

	//now we actually generate the brackets!
	event.matches = await createSwissRound(event);
	return event;
};

export const topCut = async (eventId, cut = 4) => {
	const eventOID = typecheck.stringToOid(eventId);
	cut = parseInt(cut);
	cut = typecheck.isValidNumber(cut);
	let event = await getEvent(eventId);
	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };
	if (event.tournamentType !== "swiss")
		throw { status: 400, error: "Event is not a Swiss Tournament." };

	if (Object.keys(event.matches) == 0)
		throw {
			status: 400,
			error: "Event has not started. No top cuts can be made.",
		};

	//now we actually generate the cut!

	event.matches = await swissTopCut(event, cut);
	return event;
};

export const getStandings = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	let event = await getEvent(eventId);

	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };
	if (Object.keys(event.matches) == 0)
		throw {
			status: 400,
			error: "Event has not started. No standings can be generated.",
		};

	let standings = await getTournamentStandings(event);
	return standings;
};

export const getMatch = async (event, matchId) => {
	matchId = parseInt(matchId);
	matchId = typecheck.isFiniteNumber(matchId);

	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };
	if (Object.keys(event.matches) == 0)
		throw {
			status: 400,
			error: "Event has not started. No matches can be fetched.",
		};
	let match = await getMatchFromTournament(event, matchId);
	return match;
};

export const submitScores = async (eventId, matchId, scores, winner) => {
	const eventOID = typecheck.stringToOid(eventId);
	matchId = parseInt(matchId);
	matchId = typecheck.isValidNumber(matchId);
	scores = typecheck.isNonEmptyArray(scores);
	winner = parseInt(winner);
	winner = typecheck.isValidNumber(winner);

	if (winner < 1 || winner > 2) throw { status: 400, error: "Invalid winner." };
	if (scores.length < 2) throw { status: 400, error: "Invalid scores." };
	scores[0] = typecheck.isValidNumber(parseInt(scores[0]));
	scores[1] = typecheck.isValidNumber(parseInt(scores[1]));

	if (scores[0] < 0 || scores[1] < 0)
		throw { status: 400, error: "Scores must be positive integers." };
	if (scores[0] > 999 || scores[1] > 999)
		throw { status: 400, error: "Scores must be integers less than 1000." };

	if (scores[0] < scores[1] && winner === 1) throw { status: 400, error: "Team 1 cannot win with a score less than team 2." };
	if (scores[1] < scores[0] && winner === 2) throw { status: 400, error: "Team 2 cannot win with a score less than team 1." };

	let event = await getEvent(eventId);
	if (!event.eventType.includes("tournament"))
		throw { status: 400, error: "Event is not a tournament." };

	await submitScoresForMatch(event, matchId, scores, winner);
	return event;
};

export const translateBracket = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	const playerOID = typecheck.stringToOid(playerId);
	const eventCollection = await events();
	let playerInfo = await playerFunctions.getPlayer(playerId);
	if (!playerInfo) throw { status: 404, error: "Could not find player" };
	let info;
	try {
		info = await eventCollection.findOne({ _id: eventOID });
		info = await eventCollection.updateOne(
			{ _id: eventOID, "reservations.players._id": playerOID },
			{ $pull: { "reservations.$.players": { _id: playerOID } } }
		);
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "An Internal Server Error Occurred" };
	}
	if (!info) throw { status: 500, error: "Could not delete reservation" };
	return info;
};