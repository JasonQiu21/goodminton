import * as typecheck from "./typecheck.js";
import { events } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

const eventTypes = ["tournament", "leaguenight", "practice"];

const createEvent = async (
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
      matches: (eventType === "practice") ? null : {},
      reservations: [],
    });
    if(!insertInfo.acknowledged) throw { status: 500, error: "An error occurred while creating event" };
  } catch (e) {
    console.log(e);
    throw { status: 500, error: "An error occurred while creating event" };
  }
};
