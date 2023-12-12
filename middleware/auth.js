export const authenticatePlayer = async (req, res, next) => {
    if(!req.session) return res.redirect("/login");
    return next();
};

export const authenticateAdmin = async(req, res, next) => {
    if(!req.session) return res.redirect("/login");
    if(req.session.player.role !== "admin") return res.redirect("/forbidden");
    return next();
}
