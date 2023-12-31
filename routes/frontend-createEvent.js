import { Router } from "express";
import * as typecheck from "../typecheck.js";
const router = Router();

router
    .route('/')
    .get(async (req, res) => {
        try {
            res.render('createEvent', {
                title: "Create Event",
                user: req.session?.player,
                id: req.session?.player?._id,
                isAdmin: req.session?.player?.role === "admin"
            });
        } catch (e) {
            return res.status(400).render("error", {
                user: req.session?.player,
                id: req.session?.player?._id,
                isAdmin: req.session?.player?.role === "admin",
                error: (e.status) ? e.error : "An uncaught error has occured. Please contact the developers!"
            });
        }
    })

export default router;