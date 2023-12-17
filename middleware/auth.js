export const authenticatePlayer = async (req, res, next) => {
    if(!req.session) return res.redirect("/login");
    return next();
};

export const authenticateAdmin = async(req, res, next) => {
    if(!req.session) return res.redirect("/login");
    if(req.session.player.role !== "admin") return res.redirect("/forbidden");
    return next();
}

// This function ensures that a player has access to routes, but only for themselves
// For example, a player should be able to register themselves and only themselves.
// Or edit their profile but not others.
// Admin should be able to register anyone 
export const checkPlayerIdAgainstRequestBody  = async(req, res, next) => {
    if(!req.session) return res.redirect("/login");
    if(req.session?.player?.role !== "admin"){
        if(!req.body?.playerId) req.body.playerId = req.session?.player?._id;
        if(req.body.playerId !== req.session.player._id) return res.redirect("/forbidden");
    }
    return next();
}