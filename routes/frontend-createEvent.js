import { Router } from "express";
import * as typecheck from "../typecheck.js";
const router = Router();

router
    .route('/')
    .get(async(req, res) => {
        try {
            res.render('createEvent', {
                title: "Create Event",
                user: req.session?.player,
                id: req.session?.player?._id, 
                isAdmin: req.session?.player?.role === "admin"});
        }catch(e) {
            res.render("error");
        }
    })

export default router;