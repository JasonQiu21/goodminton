import { authenticatedPlayer, authenticatedAdmin } from '../data/auth.js'

export const authenticatePlayer = async (req, res, next) => {
    try { await authenticatedPlayer(req.cookies.sessionID); } catch (e) { return res.status(403).json(e) }
    return next();
};

export const authenticateAdmin = async (req, res, next) => {
    try { await authenticatedAdmin(req.cookies.sessionID); } catch (e) { return res.status(403).json(e) }
    return next();
}

// This function ensures that a player has access to routes, but only for themselves
// For example, a player should be able to register themselves and only themselves.
// Or edit their profile but not others.
// Admin should be able to register anyone 
export const checkPlayerIdAgainstRequestBody = async (req, res, next) => {
    try {
        const player = await authenticatedPlayer(req.cookies.sessionID);
        if (player._id.toString() !== req.params.id && player.role !== "admin") return res.status(403).json({ status: 403, error: "Forbidden." });
    } catch (e) { return res.status(403).json(e) }
    return next();
}