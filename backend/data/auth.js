import crypto from 'crypto';
import { sessions } from "../config/mongoCollections.js";
import { getPlayer } from "./players.js"

export const generateSessionId = () => { return crypto.randomBytes(16).toString('base64'); }

export const authenticatedPlayer = async (playerId, sessionId) => {
    let sessionCol = await sessions();

    const session = await sessionCol.findOne({ "session.sessionId": sessionId });
    if (session === null) throw { status: 403, error: "Forbidden." }

    if (session.playerId !== playerId) throw { status: 403, error: "Forbidden." }

    const player = await getPlayer(playerId);

    return player;
}

export const authenticatedAdmin = async (playerId, sessionId) => {
    const player = await authenticatedPlayer(playerId, sessionId);
    if (player.role !== "admin") throw { status: 403, error: "Forbidden." }
    return player;
}