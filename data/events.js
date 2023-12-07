import * as typecheck from "../typecheck.js";
import { events, players } from "../config/mongoCollections.js";
import { generateElimTournament, createSwissRound, generateRoundRobinTournament, getTournamentStandings, submitScoresForMatch, getMatchFromTournament, translationElimBracketLayer } from "./eventgeneration.js";
import * as playerFunctions from './players.js';


const eventTypes = ["tournament", "leaguenight", "practice"];

export const createEvent = async (
	eventName,
	eventDate,
	eventType
) => {
	const eventsCol = await events();
	//input validation
	eventName = typecheck.isValidString(eventName, "Event Name");
	eventDate = typecheck.isFiniteNumber(eventDate, "Event Date");
	if (eventDate < 0)
		throw { status: 400, error: "Event Date must be a nonnegative number" };

	eventType = typecheck.isValidString(eventType, "Event Type").toLowerCase();
	if (!eventTypes.includes(eventType))
		throw { status: 400, error: "Invalid event type." };
	//in this case, reservations need to be made
	try {
		var { acknowledged, insertedId } = await eventsCol.insertOne({
			name: eventName,
			date: eventDate,
			type: eventType,
			matches: eventType === "practice" ? null : {},
			reservations: [],
		});
		if (!insertInfo.acknowledged) throw { status: 500, error: "An error occurred while creating event" };
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "An error occurred while creating event" };
	}
	if (!acknowledged || !insertedId)
		throw { status: 500, error: "Error while creating event" };
	return await getEvent(insertedId.toString());
};

export const getAllEvents = async () => {
	const eventsCol = await events();
	let res;
	try {
		res = await eventsCol.find({}).project({ _id: 1, name: 1 }).toArray();
		return res;
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "Error getting data" };
	}
};

export const getEvent = async (eventId) => {
	eventId = typecheck.stringToOid(eventId);
	const eventsCol = await events();
	let res;
	try {
		res = await eventsCol.findOne({ _id: eventId });
	} catch (e) {
		console.log(e);
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
		throw { status: 400, error: "Event not updated - no changes passed" }
	if (modifiedCount !== 1)
		throw { status: 500, error: `Error while updating ${eventId}` };

	return await getEvent(eventId);
};

export const deleteEvent = async (eventId) => {
	eventId = typecheck.stringToOid(eventId);
	const evensCol = await events();
	let event = await getEvent(eventId);
	try {
		var res = await eventsCol.findOneAndDelete({ _id: id });
	} catch (e) {
		console.log(e);
		throw { status: 500, error: `Error while removing ${eventId}` };
	}

	try {
		res = typecheck.isNonEmptyObject(res)
	} catch (e) {
		throw { errorCode: 404, message: `Could not delete event with id '${id.toString()}'` };
	}

	return { event: res, deleted: true };
};

export const startTournament = async (eventId, seeded) => {
	const eventOID = typecheck.stringToOid(eventId);
	seeded = typecheck.isBool(seeded);
	let event = await getEvent(eventId);

	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };

	if (Object.keys(event.matches) > 0 && event.eventType !== "Swiss Tournament") throw { status: 400, error: "Tournament has already been generated." };
	//now we actually generate the brackets!
	if (event.eventType === "Single Elimination Tournament" || event.eventType === "Double Elimination Tournament") event.matches = await generateElimTournament(event, seeded);
	else if (event.eventType === "Round Robin Tournament") event.matches = await generateRoundRobinTournament(event, seeded);
	else throw { status: 400, error: "Invalid tournament type." };

	return event;

}

export const generateSwissRound = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	let event = await getEvent(eventId);
	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };
	if (event.eventType !== "Swiss Tournament") throw { status: 400, error: "Event is not a Swiss Tournament." };

	//now we actually generate the brackets!
	event.matches = await createSwissRound(event);
	return event;
}

export const topCut = async (eventId, cut) => {
	const eventOID = typecheck.stringToOid(eventId);
	cut = typecheck.isInt(cut);
	let event = await getEvent(eventId);
	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };
	if (event.eventType !== "Swiss Tournament") throw { status: 400, error: "Event is not a Swiss Tournament." };

	if (Object.keys(event.matches) == 0) throw { status: 400, error: "Event has not started. No top cuts can be made." };

	//now we actually generate the cut!

	event.matches = await topCut(event, cut);
	return event;
}

export const getStandings = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	let event = await getEvent(eventId);

	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };
	if (Object.keys(event.matches) == 0) throw { status: 400, error: "Event has not started. No standings can be generated." };

	let standings = await getTournamentStandings(event);
	return standings;

}

export const getMatch = async (eventId, matchId) => {
	const eventOID = typecheck.stringToOid(eventId);
	matchId = typecheck.isValidNumber(matchId);
	let event = await getEvent(eventId);

	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };
	if (Object.keys(event.matches) == 0) throw { status: 400, error: "Event has not started. No matches can be fetched." };
	let match = await getMatchFromTournament(event, matchId);
	return match;

}

export const submitScores = async (eventId, matchId, scores, winner) => {
	const eventOID = typecheck.stringToOid(eventId);
	matchId = typecheck.isValidNumber(matchId);
	scores = typecheck.isNonEmptyArray(scores);
	winner = typecheck.isValidNumber(winner);

	if (winner < 1 || winner > 2) throw { status: 400, error: "Invalid winner." };
	if (scores.length < 2) throw { status: 400, error: "Invalid scores." };
	if (scores[0] < 0 || scores[1] < 0) throw { status: 400, error: "Invalid scores." };

	let event = await getEvent(eventId);
	if (!event.eventType.includes("Tournament")) throw { status: 400, error: "Event is not a tournament." };

	let verification = await submitScoresForMatch(event, matchId, scores, winner);
	return event;
}


export const translateBracket = async (eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	const playerOID = typecheck.stringToOid(playerId);
	const eventCollection = await events();
	let playerInfo = await playerFunctions.getPlayer(playerId);
	if (!playerInfo) throw { status: 404, error: 'Could not find player' };
	let info;
	try {
		info = await eventCollection.findOne({ _id: eventOID });
		console.log(info);
		info = await eventCollection.updateOne({ _id: eventOID, 'reservations.players._id': playerOID }, { $pull: { 'reservations.$.players': { _id: playerOID } } });
	} catch (e) {
		console.log(e);
		throw { status: 500, error: "An Internal Server Error Occurred" };
	}
	if (!info) throw { status: 500, error: 'Could not delete reservation' };
	return info;
};