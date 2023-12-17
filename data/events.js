import * as typecheck from "../typecheck.js";
import { events, players } from "../config/mongoCollections.js";
import * as playerFunctions from "./players.js";

const eventTypes = ["singlestournament", "doublestournament", "practice"];

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
    res = await eventsCol
      .find({})
      .project({ _id: 1, name: 1, date: 1 })
      .toArray();
    return res;
  } catch (e) {
    console.log(e);
    throw { status: 500, error: "Error getting data" };
  }
};

export const getEvent = async (eventId) => {
  eventId = typecheck.stringToOid(eventId);
  const eventsCol = await events();
  let res, playerName;
  try {
    res = await eventsCol.findOne({ _id: eventId });
	console.log(res);
	for (let i in res.reservations) {
		console.log(i);
		for (let j in res.reservations[i].players) {
			console.log(j);
			playerName = await playerFunctions.getPlayer(res.reservations[i].players[j]._id.toString());
			if (!playerName.playerName) throw {status: 404, error: "Error getting player name"};
			res.reservations[i].players[j].playerName = playerName.playerName;
		}
	}
	console.log(res);
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
    console.log(playerInfo);
  } catch (e) {
    throw { status: 404, error: "Player not found" };
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
    console.log(reservations);
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
    console.log(info);
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
