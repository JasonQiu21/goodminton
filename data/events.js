import * as typecheck from "../typecheck.js";
import { events , players } from "../config/mongoCollections.js";
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

export const createReservation = async(playerId, eventId, time=null, court=null) => {
	if (!playerId || !eventId) throw {status: 400, error: "PlayerID or EventID missing"};
	const playerCollection = await players();
	const eventCollection = await events();
	let playerInfo, eventInfo;
	try {
		playerId = typecheck.stringToOid(playerId);
		eventId = typecheck.stringToOid(eventId);
		playerInfo = await playerCollection.findOne({_id: playerId}, {projection: {_id: 1, playerName: 1}});
		eventInfo = await eventCollection.findOne({_id: eventId});
	} catch(e) {
		throw e;
	}
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
	if (eventInfo.eventType === "practice") {
		if (!time) throw {status: 400, error: "Need time for practice"};
		try {
			time = typecheck.isValidUnix(time);
			// if (typeof(court) !== "number") throw {status: 400, error: "Court needs to be a number"};
			// if (court !== 1 && court !== 2 && court !== 3) throw {status: 400, error: "Court needs to be a number between 1-3"};
			let reservation = await eventCollection.findOne({_id: eventId, 'reservations.time': time}, {projection: {_id: 0, 'reservations.$': 1}});
			console.log(reservation);
			if (reservation) {
				if (reservation.reservations[0].players.length === 4) throw {status: 500, error: "Court full"};
				const info = await eventCollection.updateOne({_id: eventId, 'reservations.time': time}, {$addToSet:{'reservations.$.players': playerInfo}});
				if (!info.acknowledged) throw {status: 500, error: "Could not add reservation"};
				return {player: playerInfo.playerName, event: eventInfo.name, created: true};
			}
			else {
				const toInsert = {
					time: time,
					players: [playerInfo]
				}
				const info = await eventCollection.updateOne({_id: eventId}, {$push: {reservations: toInsert}});
				if (!info.acknowledged) throw {status: 500, error: "Could not add reservation"};
				return {player: playerInfo.playerName, event: eventInfo.name, created: true};
			}

		} catch(e) {
			throw e;
		}
		return;
	}
};

export const deleteReservation = async(playerId, eventId) => {
	try {
		const eventOID = typecheck.stringToOid(eventId);
		const playerOID = typecheck.stringToOid(playerId);
		const eventCollection = await events();
		let playerInfo = await playerFunctions.getPlayer(playerId);
		if (!playerInfo) throw {status: 404, error: 'Could not find player'};
		let info = await eventCollection.updateOne({_id: eventOID}, {$pull: {'reservations': {'players._id': playerOID}}});
		if (!info) throw {status: 500, error: 'Could not delete reservation'};
		return info;
	} catch(e) {
		throw e;
	}

	
};