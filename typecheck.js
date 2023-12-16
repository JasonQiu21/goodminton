import moment from "moment";
import { ObjectId } from "mongodb";
import _ from "lodash";

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
  if (!(!!num || num === 0))
    throw { status: 400, error: `${name} is not a valid number.` };

  return num;
};

export const isFiniteNumber = (num, name = "Number input") => {
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

export const isValidEvent = (event, partial = false) => {
  /*
    Checks if an object is a valid event.
    event schema: # python type syntax bc jason is dumb
      name: str
      type: str
      date: int >= 0 # unix timestamp
      matches: Optional(Dict[match]) (NOT CHECKED)
      reservations: List[match] (NOT CHECKED)

    if partial is true, then accept partial schema
  */

  // Allow _id, but do not check for it
  let keys = ["_id", "name", "eventType", "date"];
  Object.keys(event).forEach((key) => {
    if (!keys.includes(key))
      throw { status: 400, error: `Extraneous key '${key}'` };
  });

  if (!partial || event?.name)
    event.name = isValidString(event.name, "Event Name", false);
  if (!partial || event?.eventType) {
    event.eventType = isValidString(event.eventType, "Event Type", false);

    const eventTypes = ["tournament", "leaguenight", "practice"];
    if (!eventTypes.includes(event.eventType))
      throw { status: 400, error: "Invalid event type." };
  }
  if (!partial || event?.date || event?.date === 0) {
    event.date = isFiniteNumber(event.date, "Event Date");
    if (event.date < 0)
      throw { status: 400, error: "Event Date must be a nonnegative number" };
  }

  return event;
};

export const isValidPlayer = (player, partial = false) => {
  let keys = [
    "_id",
    "password",
    "playerName",
    "email",
    "phone",
    "role",
    "singlesRating",
    "doublesRating",
  ];
  Object.keys(player).forEach((key) => {
    if (!keys.includes(key))
      throw { status: 400, error: `Extraneous key '${key}'` };
  });

  if(!isNonEmptyObject(player)) throw {status: 400, error: "Player is not a nonempty object"}

  if(!partial || player?.password){
    player.password = isValidString(player.password, "Password", false);
  }

  if(!partial || player?.playerName){
    player.playerName = isValidString(player.playerName, "Player Name", false);
  }

  if(!partial || player?.email){
    player.email = checkEmail(player.email, "Email", false);
  }

  if(!partial || player?.phone){
    if(player.phone !== null) {
      player.phone = isValidString(player.phone)
    }
  }

  if(!partial || player?.role){
    player.role = isValidString(player.role, "Player Role")
    const validRoles = ["admin", "user"]
    if(!validRoles.contains(player.role)) throw {status: 400, error: "Invalid role"}
  }

  if(!partial || player?.singlesRating){
    player.singlesRating = isFiniteNumber(player.singlesRating, "Singles Rating");
  }
  if(!partial || player?.doubelsRating){
    player.doubelsRating = isFiniteNumber(player.doubelsRating, "Doubles Rating");
  }

  return player;
};

export const isValidUnix = (eventDate) => {
  if (!eventDate) throw { status: 400, error: "No eventDate" };
  if (typeof eventDate !== "number")
    throw { status: 400, error: "eventDate not a int" };
  if (!moment.unix(eventDate).isValid())
    throw { status: 400, error: "eventDate not valid unix" };
  return eventDate;
};

export const checkEmail = (str) => {
  str = isValidString(str);
  str = _.toLower(str);
  let [prefix, domain] = str.split("@");

  const prefixRegex = /^[a-zA-Z0-9_.-]+$/;
  const prefixRegex2 = /^[_.-]+$/;
  const domainRegex = /^[a-zA-Z0-9-]+$/;

  if (!prefixRegex.test(prefix))
    throw { status: 400, error: "Email prefix bad" };
  if (prefixRegex2.test(prefix.charAt(prefix.length - 1)))
    throw { status: 400, error: "Email prefix bad" };

  if (!domain) throw { status: 400, error: "bad email" };
  let end;
  [domain, end] = domain.split(".");
  if (!end) throw { status: 400, error: "bad email" };
  if (!domainRegex.test(domain))
    throw { status: 400, error: "Bad email domain" };

  if (!/^[a-zA-Z]+$/.test(end) || end.length < 2)
    throw { status: 400, error: "Bad email domain" };
  return str;
};

export const isValidId = (id) => {
  if (!id) throw { status: 400, error: "No id" };
  if (typeof id !== "string") throw { status: 400, error: "Id not a string" };
  id = id.trim();
  if (id.length === 0) throw { status: 400, error: "Id empty string" };
  if (!ObjectId.isValid(id)) throw { status: 400, error: "Invalid object Id" };
  return id;
};
