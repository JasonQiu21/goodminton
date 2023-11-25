import { players } from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';
import * as helperFunctions from './typecheck.js';

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
    
    //TODO
};

// export {getAllPlayers, createNewPlayer};
export {getAllPlayers};