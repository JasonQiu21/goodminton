import { players, events } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import * as helperFunctions from "../typecheck.js";
import { getAllEvents, getEvent } from "./events.js";
import bcrypt from "bcrypt";
const saltRounds = 16;

const getAllPlayers = async () => {
  const playerCollection = await players();
  let playerList = await playerCollection
    .find({})
    .project({ password: 0 })
    .toArray();
  if (!playerList) throw "Could not get all players";
  return playerList;
};

const createNewPlayer = async (playerName, email, password, phone = null) => {
  const playerCollection = await players();
  try {
    playerName = helperFunctions.isValidString(playerName);
    password = helperFunctions.isValidString(password);
    email = helperFunctions.checkEmail(email);
  } catch (e) {
    throw e;
  }
  if (phone) {
    phone = helperFunctions.isValidString(phone);
    if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone)
    )
      throw { status: 400, error: "Bad phone number" };
  }

  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    await getPlayerByEmail(email);
    throw { status: 400, error: "A user with this email already exists." };
  } catch (e) {
    if (e?.status !== 404) {
      throw e;
    }
  }

  let answer = {
    playerName: playerName,
    email: email,
    password: passwordHash,
    phone: phone,
    singlesRating: 800,
    doublesRating: 800,
  };
  let info;
  try {
    info = await playerCollection.insertOne(answer);
  } catch (e) {
    console.log(`Error on createNewPlayer: ${e}`);
    throw { status: 500, error: "Error while creating player" };
  }
  if (!info.acknowledged || !info.insertedId)
    throw { status: 500, error: "Could not add event" };
  const newId = info.insertedId.toString();
  const player = await getPlayer(newId);
  return player;
};

const getPlayer = async (id) => {
  id = helperFunctions.isValidId(id);
  const playerCollection = await players();
  let player;
  try {
    player = await playerCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
  } catch (e) {
    console.log(`Error on getPlayer: ${e}`);
    throw { status: 500, error: `Error while getting player ${id}` };
  }
  if (player === null) throw { status: 404, error: "No player with id" };
  player._id = player._id.toString();
  return player;
};

const getPlayerByEmail = async (email) => {
  let player;
  try {
    email = helperFunctions.checkEmail(email);
    const playerCollection = await players();
    player = await playerCollection.findOne(
      { email: email },
      { projection: { password: 0 } }
    );
  } catch (e) {
    console.log(`Error on getPlayer: ${e}`);
    throw { status: 500, error: `Error while getting player ${id}` };
  }
  if (player === null) throw { status: 404, error: "No player with id" };
  player._id = player._id.toString();
  return player;
};

const removePlayer = async (id) => {
  //TODO
  id = helperFunctions.isValidId(id);
  const playerCollection = await players();
  let info;
  try {
    info = await playerCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });
  } catch (e) {
    console.log(`Error on removePlayer: ${e}`);
    throw { status: 500, error: `Error while deleting player ${id}` };
  }
  if (!info) throw { status: 404, error: "No player with id" };
  const answer = {
    playerName: info.playerName,
    deleted: true,
  };
  return answer;
};

const updatePlayer = async (id, body) => {
  //TODO
  if (!id) throw { status: 400, error: "No body" };
  if (!body) throw { status: 400, error: "No body" };
  let playerName, email, password, phone, singlesRating, doublesRating;
  if (body.playerName)
    playerName = helperFunctions.isValidString(body.playerName);
  if (body.email) {
    email = helperFunctions.checkEmail(body.email);
    try {
      let player = await getPlayerByEmail(email);
      throw { status: 400, error: "Email already registered for another user" };
    } catch (e) {
      if (e?.status !== 404)
        throw {
          status: 400,
          error: "Email already registered for another user",
        };
    }
  }
  if (body.password) {
    password = helperFunctions.isValidString(body.password);
    var passwordHash = await bcrypt.hash(password, saltRounds);
  }
  if (body.phone) {
    phone = helperFunctions.isValidString(body.phone);
    if (!/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/im.test(phone))
      throw { status: 400, error: "Bad phone number" };
  }
  if (body.singlesRating)
    singlesRating = helperFunctions.isValidNumber(body.singlesRating);
  if (body.doublesRating)
    doublesRating = helperFunctions.isValidNumber(body.doublesRating);
  let newInfo = {
    ...(body.playerName && { playerName: playerName }),
    ...(body.email && { email: email }),
    ...(body.password && { password: passwordHash }),
    ...(body.phone && { phone: phone }),
    ...(body.singlesRating && { singlesRating: singlesRating }),
    ...(body.doublesRating && { doublesRating: doublesRating }),
  };
  // console.log(JSON.stringify(newInfo));
  const playerCollection = await players();
  try {
    var { matchedCount, modifiedCount } = await playerCollection.updateOne(
      { _id: helperFunctions.stringToOid(id) },
      { $set: newInfo }
    );
  } catch (e) {
    console.log(`Error on updatePlayer: ${e}`);
    throw { status: 500, error: `Error while updating player ${id}` };
  }
  if (matchedCount === 0) throw { status: 404, error: "Player not found" };
  else if (matchedCount !== 1) {
    console.log(
      `<ERROR> found ${matchedCount} documents with same ObjectID. playerId: ${id}`
    );
    throw { status: 500, error: `Error while updating ${id}` };
  }

  if (modifiedCount === 0)
    throw { status: 400, error: "Player not updated - no changes were given" };
  else if (modifiedCount !== 1)
    throw { status: 500, error: `Error while updating ${id}` };

  return await getPlayer(id);
};

const authenticatePlayer = async (email, password) => {
  // Error messages intentionally suppressed for security
  try {
    // Validate email and password
    email = helperFunctions.checkEmail(email);
    password = helperFunctions.isValidString(password);

    // Find player in question
    const playerCollection = await players();
    let player = await playerCollection.findOne(
      { email: email },
      { projection: { password: 1 } }
    );
    if (player === null) throw { status: 404, error: "Player not found" };

    // Match passwords
    let passwordMatch = false;
    passwordMatch = await bcrypt.compare(password.trim(), player.password);
    if (!passwordMatch) throw { status: 401, error: "Invalid password" };
    return await getPlayerByEmail(email);
  } catch (e) {
    throw {
      status: 401,
      error: "Either the email or password provided are invalid",
    };
  }
};

const getReservations = async (playerId) => {
  let playerOid = helperFunctions.stringToOid(playerId);
  await getPlayer(playerId);
  const eventsCol = await events();
  try {
    var reservations = await eventsCol
      .find({ reservations: { $elemMatch: { "players._id": playerOid } } })
      .toArray();
    // console.log(reservations);
  } catch (e) {
    console.log(`Error on getReservations: ${e}`);
    throw {
      status: 500,
      error: `Error while getting reservations for player ${id}`,
    };
  }
  try {
    helperFunctions.isNonEmptyArray(reservations)
  } catch (e) {
    throw { status: 404, error: "No reservations" };
  }
  return reservations.map((event) => {
    let time = 0;
    event.reservations.forEach(res => {
      res.players.forEach(player => {
        if (player._id.toString() === playerId.trim()) time = res.time
      })
    })
    return { _id: event._id.toString(), name: event.name, time: time };
  });
};

const getAllMatches = async (id) => {
  id = helperFunctions.isValidId(id);
  const playerCollection = await players();
  let player;
  try {
    player = await playerCollection.findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
  } catch (e) {
    console.log(`Error on getPlayer: ${e}`);
    throw { status: 500, error: `Error while getting player ${id}` };
  }
  if (player === null) throw { status: 404, error: "No player with id" };
  player._id = player._id.toString();

  const allEvents = await getAllEvents();

  let playerMatches = [];

  id = helperFunctions.stringToOid(id);

  for (let i = 0; i < allEvents.length; i++) {
    let event = await getEvent(allEvents[i]._id.toString());

    for (let round in event.matches) {
      for (let match of event.matches[round]) {
        if ((match.team1 !== null || match.team2 !== null) && !match.byeround) {
          if (match.team1 !== null && (match.team1[0]._id.equals(id) || (match.team1.length > 1 && match.team1[1]._id.equals(id))) && match.winner !== 0) {
            match.eventId = event._id.toString(); //so that you can reference back to the match
            playerMatches.push(match);
          }
          if (match.team2 !== null && (match.team2[0]._id.equals(id) || (match.team2.length > 1 && match.team2[1]._id.equals(id))) && match.winner !== 0) {
            match.eventId = event._id.toString(); //so that you can reference back to the match
            playerMatches.push(match);
          }
        }
      }
    }
  }

  return playerMatches;
}

export {
  getAllPlayers,
  createNewPlayer,
  getPlayer,
  updatePlayer,
  removePlayer,
  authenticatePlayer,
  getReservations,
  getAllMatches
};
