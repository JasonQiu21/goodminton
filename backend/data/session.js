import { sessions } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import * as helperFunctions from '../typecheck.js';

export const createSession = async (player) => {
    const sessionsCol = await sessions();

    let info;
    delete player.phone;
    delete player.email;
    delete player.doublesRating;
    delete player.singlesRating;

    try {
        info = await sessionsCol.insertOne({
            player: player,
            createdAt: new Date()
        })
    } catch (e) {
        console.log(`Error on creating session: ${e}`);
        throw { status: 500, error: "Internal Server Error." };
    }

    if (!info.acknowledged || !info.insertedId) throw { status: 500, error: "Could not create session." };

    return info.insertedId;
}

export const findSession = async (sessionId) => {
    sessionId = helperFunctions.stringToOid(sessionId);
    const sessionsCol = await sessions();
    let session;

    try {
        session = await sessionsCol.findOne({
            _id: sessionId
        })
    } catch (e) {
        console.log(`Error on finding session: ${e}`);
        throw { status: 500, error: "Internal Server Error." };
    }

    if (session === null) throw { status: 404, error: "Login session not found." }
    return session.player;
}

export const deleteSession = async (sessionId) => {
    sessionId = helperFunctions.isValidId(id);
    const sessionsCol = await sessions();
    let info;

    try {
        info = await sessionsCol.findOneAndDelete({
            _id: new ObjectId(sessionId)
        })
    } catch (e) {
        console.log(`Error on deleting session: ${e}`);
        throw { status: 500, error: "Internal Server Error." };
    }

    if (!info) throw { status: 404, error: "Login session not found." };

    return { status: 200, message: "Deletion successful." }
}