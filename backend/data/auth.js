import { sessions } from "../config/mongoCollections.js";
import { getPlayer } from "./players.js"
import { ObjectId } from 'mongodb'

export const authenticatedPlayer = async (sessionId) => {
    let sessionCol = await sessions();

    const session = await sessionCol.findOne({ "_id": new ObjectId(sessionId) });
    if (session === null) throw { status: 403, error: "Forbidden." }

    return session.player;
}

export const authenticatedAdmin = async (sessionId) => {
    const player = await authenticatedPlayer(sessionId);
    if (player.role !== "admin") throw { status: 403, error: "Forbidden." }
    return player;
}