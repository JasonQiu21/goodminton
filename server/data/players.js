import { players } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

const getAllPlayers = async () => {
    const playerCollection = await players();
    let playerList = await playerCollection.find({}).toArray();
    if (!playerList) throw 'Could not get all players';
    return playerList;
};

const createNewPlayer = async(
    playerName, 
    picture = None, 
    email, 
    phone = None
    ) => {
    if (!playerName || !email) throw 'Bad inputs';
    if (typeof(playerName) !== "string") throw 'Bad playerName';
    //TODO
};

// export {getAllPlayers, createNewPlayer};
export {getAllPlayers};