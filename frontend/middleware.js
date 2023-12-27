const authentication = async(req, res, next) => {
    if(req.session?.user){
        
    }
}

const adminOnly = async(req, res, next) => {
    if(!req.session?.user?.admin) return next();
    if(req.session?.user) return res.redirect("/error");
    return res.redirect("/login");
}