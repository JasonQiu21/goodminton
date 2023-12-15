import { players } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helperFunctions from '../typecheck.js';
import bcrypt from "bcrypt";
const saltRounds = 16;

const getAllPlayers = async () => {
    const playerCollection = await players();
    let playerList = await playerCollection.find({}).project({password:0}).toArray();
    if (!playerList) throw 'Could not get all players';
    return playerList;
};

const createNewPlayer = async(
    playerName, 
    email, 
    password,
    phone = null
    ) => {
    const playerCollection = await players();
    playerName = helperFunctions.isValidString(playerName);
    email = helperFunctions.isValidString(email);
    password = helperFunctions.isValidString(password);
    helperFunctions.checkEmail(email);
    if (phone) {
        phone = helperFunctions.isValidString(phone);
        if (!(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone))) throw { status: 400, error: "Bad phone number"};
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    try{
        await getPlayerByEmail(email);
        throw {status: 400, error: "A user with this email already exists."}
    } catch (e) {
        if(e?.status !== 404){
            throw e;
        }
    }

    let answer = {
        "playerName": playerName,
        "email": email,
        "password": passwordHash,
        "phone": phone,
        "singlesRating": 800,
        "doublesRating": 800
    }
    let info;
    try{
        info = await playerCollection.insertOne(answer);
    } catch (e){
        console.log(`Error on createNewPlayer: ${e}`);
        throw {status: 500, error: "Error while creating player"};
    }
    if (!info.acknowledged || !info.insertedId) throw { status: 500, error: "Could not add event" };
    const newId = info.insertedId.toString();
    const player = await getPlayer(newId);
    return player;
};

const getPlayer = async (id) => {
    id = helperFunctions.isValidId(id);
    const playerCollection = await players();
    let player;
    try{
        player = await playerCollection.findOne({_id: new ObjectId(id)}, {projection: {password:0}});
    } catch (e) {
        console.log(`Error on getPlayer: ${e}`);
        throw {status: 500, error: `Error while getting player ${id}`};
    }
    if (player === null) throw { status: 404, error: "No player with id" };
    player._id = player._id.toString();
    return player;
};

const getPlayerByEmail = async(email) => {
    email = helperFunctions.isValidString(email);
    const playerCollection = await players();
    let player;
    try{
        player = await playerCollection.findOne({email: email}, {projection: {password:0}});
    } catch (e) {
        console.log(`Error on getPlayer: ${e}`);
        throw {status: 500, error: `Error while getting player ${id}`};
    }
    if (player === null) throw { status: 404, error: "No player with id" };
    player._id = player._id.toString();
    return player;
}

const removePlayer = async (id) => {
    //TODO
    id = helperFunctions.isValidId(id);
    const playerCollection = await players();
    let info;
    try{
        info = await playerCollection.findOneAndDelete({
            _id: new ObjectId(id)
        });
    } catch (e) {
        console.log(`Error on removePlayer: ${e}`);
        throw {status: 500, error: `Error while deleting player ${id}`};
    }
    if (!info) throw { status: 404, error: "No player with id" };
    const answer = {
        "playerName": info.playerName,
        "deleted": true
    };
    return answer;
};

const updatePlayer = async (id, body) => {
    //TODO
    if (!id) throw { status: 400, error: "No body" };
    if (!body) throw { status: 400, error: "No body" };
    let playerName, email, password, phone, singlesRating, doublesRating
    if (body.playerName) playerName = helperFunctions.isValidString(body.playerName);
    if (body.email) {
        email = helperFunctions.isValidString(body.email);
        helperFunctions.checkEmail(email);
    }
    if (body.password) password = helperFunctions.isValidString(body.password);
    if (body.phone) {
        phone = helperFunctions.isValidString(body.phone);
        if (!(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone))) throw { status: 400, error: "Bad phone number"};
    }
    if(body.singlesRating) singlesRating = helperFunctions.isValidNumber(body.singlesRating);
    if(body.doublesRating) doublesRating = helperFunctions.isValidNumber(body.doublesRating);
    let newInfo = {
        ...body.playerName && {playerName: playerName},
        ...body.email && {email: email},
        ...body.password && {password: password},
        ...body.phone && {phone: phone},
        ...body.singlesRating && {singlesRating: singlesRating},
        ...body.doublesRating && {doublesRating: doublesRating}
    };
    // console.log(JSON.stringify(newInfo));
    const playerCollection = await players();
    let info;
    try{
        info = await playerCollection.findOneAndUpdate(
            {_id: new ObjectId(id)}, 
            {$set: newInfo}
        );
    } catch (e) {
        console.log(`Error on updatePlayer: ${e}`);
        throw {status: 500, error: `Error while updating player ${id}`};
    }
    if (!info) throw { status: 404, error: "No player with id" };
    const updatedInfo = await playerCollection.find({_id: new ObjectId(id)}).toArray();
    return updatedInfo;
};

const authenticatePlayer = async(email, password) => {
    // Error messages intentionally suppressed for security
    try{
        // Validate email and password
        email = helperFunctions.checkEmail(email);
        password = helperFunctions.isValidString(password);

        // Find player in question
        const playerCollection = await players();
        let player = await playerCollection.findOne({email: email}, {projection: {password: 1}});
        if(player === null) throw {status: 401, error: "Player not found"};

        // Match passwords
        let passwordMatch = false;
        passwordMatch = await bcrypt.compare(password.trim(), player.password);
        if(!passwordMatch) throw {status: 401, error: "Invalid password"};
        return (await getPlayerByEmail(email));
    } catch (e){
        throw {status: 401, error: "Either the email or password provided are invalid"};
    }
}

export {getAllPlayers, createNewPlayer, getPlayer, updatePlayer, removePlayer, authenticatePlayer};
