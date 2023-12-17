import * as typecheck from "../typecheck.js";
import { events , players } from "../config/mongoCollections.js";
import { generateElimTournament, createSwissRound, generateRoundRobinTournament } from "./eventgeneration.js";
import * as playerFunctions from './players.js';


const eventTypes = ["tournament", "leaguenight", "practice"];

export const createEvent = async (eventName, eventDate, eventType) => {
	const eventsCol = await events();
	//input validation
	eventName = typecheck.isValidString(eventName, "Event Name");
	eventDate = typecheck.isValidUnix(eventDate);
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
		if (!acknowledged)
			throw { status: 500, error: "An error occurred while creating event" };
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
	if(modifiedCount == 0)
		throw{ status: 400, error: "Event not updated - no changes passed" }
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

export const createReservation = async(playerId, eventId, time) => {
	if (!playerId || !eventId) throw {status: 400, error: "PlayerID or EventID missing"};
	const eventCollection = await events();
	let playerOid = typecheck.stringToOid(playerId);
	let eventOid = typecheck.stringToOid(eventId);
	if (!time) throw {status: 400, error: "Need time"};
	time = typecheck.isValidUnix(time);

	let player = await playerFunctions.getPlayer(playerId);
	let playerInfo = {_id: player._id, playerName: player.playerName};
	let eventInfo = await getEvent(eventId);

	try {
		playerInfo = typecheck.isNonEmptyObject(playerInfo);
		console.log(playerInfo);
	} catch(e) {
		throw {status: 404, error: 'Player not found'};
	}
	try {
		eventInfo = typecheck.isNonEmptyObject(eventInfo);
	} catch(e) {
		throw {status: 404, error: 'Event not found'};
	}
	const event = await eventCollection.findOne({_id: eventOid, 'reservations.time': time});
	if (!event) throw {status: 404, error: "No matching time and event"};
	try{
		var { reservations } = await eventCollection.findOne({_id: eventOid, 'reservations.time': time}, {projection: {_id: 0, 'reservations.$': 1}});
		console.log(reservations);
	} catch (e) {
		console.log(e);
		throw {status: 500, error: "Internal Server Error"};
	}

	if (reservations) {
		if (reservations[0].players.length >= reservations[0].max) throw {status: 500, error: "Courts are full for the provided time."};
		let info;
		info = await eventCollection.find({_id: eventOid, 'reservations.players._id': playerOid}).toArray();
		if (!info) throw {status: 404, error: "Player already reserved"};
		try{
			info = await eventCollection.updateOne({_id: eventId, 'reservations.time': time}, {$addToSet:{'reservations.$.players': playerInfo}});
		} catch (e) {
			console.log(e);
			throw {status: 500, error: "Internal Server Error"};
		}
		if (!info.acknowledged) throw {status: 500, error: "Could not add reservation"};
		return {player: playerInfo.playerName, event: eventInfo.name, created: true};
	}
	else {
		throw {error: 400, status: "There is no slot matching the time and event given."}
	}
};

export const deleteReservation = async(playerId, eventId) => {
	const eventOID = typecheck.stringToOid(eventId);
	const playerOID = typecheck.stringToOid(playerId);
	const eventCollection = await events();
	let playerInfo = await playerFunctions.getPlayer(playerId);
	if (!playerInfo) throw {status: 404, error: 'Could not find player'};
	let info;
	try{
		info = await eventCollection.findOne({_id: eventOID});
		console.log(info);
		info = await eventCollection.updateOne({_id: eventOID, 'reservations.players._id': playerOID}, {$pull: {'reservations.$.players': {_id: playerOID}}});
	} catch (e) {
		console.log(e);
		throw {status: 500, error: "An Internal Server Error Occurred"};
	}
	if (!info) throw {status: 500, error: 'Could not delete reservation'};
	return info;
};

export const startTournament = async (eventId, seeded) => {
  const eventOID = typecheck.stringToOid(eventId);
  seeded = typecheck.isBool(seeded);
  let event = await getEvent(eventId);

  if(!event.eventType.includes("Tournament")) throw {status: 400, error: "Event is not a tournament."};

  //if(Object.keys(event.matches) > 0 && event.eventType !== "Swiss Tournament") throw {status: 400, error: "Tournament has already been generated."};
  //now we actually generate the brackets!
  if(event.eventType === "Single Elimination Tournament" || event.eventType === "Double Elimination Tournament") event.matches = await generateElimTournament(event, seeded);
  else if(event.eventType === "Round Robin Tournament") event.matches = await generateRoundRobinTournament(event, seeded);
  else throw {status: 400, error: "Invalid tournament type."};

  return event;
  
}

export const generateSwissRound = async (eventId) => {
  const eventOID = typecheck.stringToOid(eventId);
  let event = await getEvent(eventId);
  if(!event.eventType.includes("Tournament")) throw {status: 400, error: "Event is not a tournament."};
  if(event.eventType !== "Swiss Tournament") throw {status: 400, error: "Event is not a Swiss Tournament."};

  //now we actually generate the brackets!
  event.matches = await generateSwissRound(event);
  return event;
}

export const topCut = async (eventId, cut) => {
  const eventOID = typecheck.stringToOid(eventId);
  cut = typecheck.isInt(cut);
  let event = await getEvent(eventId);
  if(!event.eventType.includes("Tournament")) throw {status: 400, error: "Event is not a tournament."};
  if(event.eventType !== "Swiss Tournament") throw {status: 400, error: "Event is not a Swiss Tournament."};

  if(Object.keys(event.matches) == 0) throw {status: 400, error: "Event has not started. No top cuts can be made."};

  //now we actually generate the cut!

  event.matches = await topCut(event, cut);
  return event;
}

export const getStandings = async (eventId) => {
  const eventOID = typecheck.stringToOid(eventId);
  let event = await getEvent(eventId);

  if(!event.eventType.includes("Tournament")) throw {status: 400, error: "Event is not a tournament."};
  if(Object.keys(event.matches) == 0) throw {status: 400, error: "Event has not started. No standings can be generated."};

  let standings = await getStandings(event);
  return standings;

}

export const getMatch = async (eventId, matchId) => {
  const eventOID = typecheck.stringToOid(eventId);
  matchId = typecheck.isValidNumber(eventId);
  let event = await getEvent(eventId);

  if(!event.eventType.includes("Tournament")) throw {status: 400, error: "Event is not a tournament."};
  if(Object.keys(event.matches) == 0) throw {status: 400, error: "Event has not started. No matches can be fetched."};
  let match = await getMatch(event, matchId);
  return match;
  
}