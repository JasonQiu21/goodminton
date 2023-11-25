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
    // const newId = info.insertedId.toString();
    // const event = await get(newId);
    // return event;
    return;
};

export {getAllPlayers, createNewPlayer};
