import * as typecheck from "./typecheck.js";
import { events } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const eventTypes = ["tournament", "leaguenight", "practice"];

export const createEvent = async (
  eventName,
  eventDate,
  eventType
) => {
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
    if(!acknowledged) throw { status: 500, error: "An error occurred while creating event" };
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
    res = await eventsCol.find({}).project({_id: 1, name: 1}).toArray();
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
  eventId = typecheck.stringToOid(eventId);
  const eventsCol = await events();
  let event = await getEvent(eventId);
  updatedEvent = typecheck.isNonEmptyObject(updatedEvent, "Event Updates");
  Object.keys(updatedEvent).forEach((key) => {
    event[key] = updatedEvent[key];
  });
  // Now we know that (event - updatedEvent) union (updatedEvent) is a valid event; that is, updatedEvent is a valid partial event
  event = typecheck.isValidEvent(event);
  try {
    var { matchedCount, modifiedCount } = eventsCol.updateOne(
      { _id: eventId },
      { $set: updatedEvent }
    );
  } catch (e) {
    throw { status: 500, error: `Error while updating ${eventId}` };
  }
  if (matchedCount === 0) throw { status: 404, error: "Event not found" };
  else if (matchedCount !== 1) {
    console.log(
      `<ERROR> found ${matchedCount} documents with same ObjectID. eventId: ${eventId}`
    );
    throw { status: 500, error: `Error while updating ${eventId}` };
  }
  if (modifiedCount !== 1)
    throw { status: 500, error: `Error while updating ${eventId}` };

  return await getEvent(eventId);
};

export const deleteEvent = async (eventId) => {
  const objectId = typecheck.stringToOid(eventId);
  const eventsCol = await events();
  let event = await getEvent(eventId);
  let res;
  try{
    res = await eventsCol.findOneAndDelete({_id: objectId});
  } catch (e) {
    console.log(e);
    throw {status: 500, error: `Error while removing ${eventId}`};
  }

  try{
    res = typecheck.isNonEmptyObject(res)
  } catch (e) {
    throw {errorCode: 404, message: `Could not delete event with id '${objectId.toString()}'`};
  }

  return {event: res, deleted: true};
};