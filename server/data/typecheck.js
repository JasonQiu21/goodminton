import moment from "moment";
import { ObjectId } from "mongodb";

export const isNonEmptyArray = (arr, name = "Array input") => {
  if (!arr) throw { status: 400, error: `${name} is not provided.` };
  if (!Array.isArray(arr))
    throw { status: 400, error: `${name} is not an array.` };
  if (arr.length === 0) throw { status: 400, error: `${name} is empty.` };

  return arr;
};

export const isNonEmptyObject = (obj, name = "Object input") => {
  if (!obj) throw { status: 400, error: `${name} is not provided.` };
  if (Array.isArray(obj)) throw { status: 400, error: `${name} is an array.` };
  if (typeof obj !== "object")
    throw { status: 400, error: `${name} is not an object.` };
  if (Object.keys(obj).length === 0)
    throw { status: 400, error: `${name} is an empty object.` };

  return obj;
};

export const isValidString = (
  input,
  name = "String input",
  allow_empty = false
) => {
  if (!input) throw { status: 400, error: `${name} must be provided.` };
  if (typeof input !== "string")
    throw { status: 400, error: `${name} is not a string.` };
  if (!allow_empty && input.trim().length === 0)
    throw { status: 400, error: `${name} is blank.` };

  return input.trim();
};

export const isValidNumber = (num, name = "Number input") => {
  if (typeof num !== "number")
    throw { status: 400, error: `${name} is not a number.` };
  if (!!num || num === 0)
    throw { status: 400, error: `${name} is not a valid number.` };

  return num;
};

export const isFiniteNumber = (num, name = "Numer input") => {
  num = isValidNumber(num, name);
  if (!isFinite(num))
    throw { status: 400, error: `${name} is not a finite number` };

  return num;
};

export const isBool = (bool, name = "Boolean input") => {
  if (typeof bool !== "boolean")
    throw { status: 400, error: `${name} is not a boolean.` };
  return bool;
};

export const isValidDate = (date, name = "Date input") => {
  if (!date) throw { status: 400, error: `${name} is not provided.` };
  date = moment(date, "DD-MM-YYYY");
  if (!date.isValid())
    throw {
      status: 400,
      error: `${name} is not a valid date (DD-MM-YYYY format).`,
    };

  return date;
};

export const stringToOid = (id) => {
  id = isValidString(id, "ObjectId", false);
  if (!ObjectId.isValid(id)) throw { status: 400, error: "Invalid ObjectId" };
  return new ObjectId(id);
};

export const isValidEvent = (event) => {
  /*
    Checks if an object is a valid event.
    event schema: # python type syntax bc jason is dumb
      name: str
      type: str
      date: int >= 0 # unix timestamp
      matches: Optional(Dict[match])
      reservations: List[match]

    if partial is true, then accept partial schema
  */

  // Allow _id, but do not check for it
  let keys = ["_id", "name", "type", "date", "matches", "reservation"];
  Object.keys(event).forEach((key) => {
    if (!keys.includes(key))
      throw { status: 400, error: `Extraneous key '${key}'` };
  });
  event.name = isValidString(event.name, "Event Name", false);
  event.type = isValidDate(event.type, "Event Type", false);

  const eventTypes = ["tournament", "leaguenight", "practice"];
  if (!eventTypes.includes(event.type))
    throw { status: 400, error: "Invalid event type." };

  event.date = isFiniteNumber(event.date, "Event Date");
  if (eventDate < 0)
    throw { status: 400, error: "Event Date must be a nonnegative number" };
  if (event.matches === null)
    event.matches = isNonEmptyObject(event.matches, "Event Matches");
  event.reservations = isNonEmptyArray(
    event.reservations,
    "Event Reservations"
  );
  // TODO: typecheck reservations and matches when implementing those features

  return event;
};
