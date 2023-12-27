import { authenticatedPlayer, authenticatedAdmin } from '../data/auth.js'

export const authenticatePlayer = async (req, res, next) => {
    if (!req.session?.player) return res.status(403).json({ status: 403, error: "Forbidden." });
    try { await authenticatedPlayer(req.session.player._id.toString(), req.session.sessionId); } catch (e) { return res.status(403).json(e) }
    return next();
};

export const authenticateAdmin = async (req, res, next) => {
    if (req.session?.player?.role !== "admin") return res.json({ status: 403, error: "Forbidden." });
    try { await authenticatedAdmin(req.session.player._id.toString(), req.session.sessionId); } catch (e) { return res.status(403).json(e) }
    return next();
}

// This function ensures that a player has access to routes, but only for themselves
// For example, a player should be able to register themselves and only themselves.
// Or edit their profile but not others.
// Admin should be able to register anyone 
export const checkPlayerIdAgainstRequestBody = async (req, res, next) => {
    try { await authenticatedPlayer(req.session.player._id.toString(), req.session.sessionId); } catch (e) { return res.status(403).json(e) }
    if (req.session?.player?.role !== "admin" && req.body.playerId !== req.session?.player?._id) return res.status(403).json({ status: 403, error: "Forbidden." });
    return next();
}