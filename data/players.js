import { players } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helperFunctions from './typecheck.js';

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
    let answer = {
        "playerName": playerName,
        "email": email,
        "password": password,
        "phone": phone,
        "singlesRating": 800,
        "doublesRating": 800
    }

    const info = await playerCollection.insertOne(answer);
    if (!info.acknowledged || !info.insertedId) throw { status: 500, error: "Could not add event" };
    const newId = info.insertedId.toString();
    const player = await get(newId);
    return player;
};

const get = async (id) => {
    id = helperFunctions.isValidId(id);
    const playerCollection = await players();
    const player = await playerCollection.findOne({_id: new ObjectId(id)}, {projection: {password:0}});
    if (player === null) throw { status: 404, error: "No player with id" };
    player._id = player._id.toString();
    return player;
};

const remove = async (id) => {
    //TODO
    id = helperFunctions.isValidId(id);
    const playerCollection = await players();
    const info = await playerCollection.findOneAndDelete({
        _id: new ObjectId(id)
    });
    if (!info) throw { status: 404, error: "No player with id" };
    const answer = {
        "playerName": info.playerName,
        "deleted": true
    };
    return answer;
};

const update = async (id, body) => {
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
    const info = await playerCollection.findOneAndUpdate(
        {_id: new ObjectId(id)}, 
        {$set: newInfo}
    );
    if (!info) throw { status: 404, error: "No player with id" };
    return info;
};

export {getAllPlayers, createNewPlayer, get, update, remove};