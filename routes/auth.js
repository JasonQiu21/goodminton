import { Router } from "express";
import { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent } from "../data/events.js";
import * as typecheck from '../typecheck.js';
const router = Router();

router.route("/login").post(async (req, res) => {
    try{
        email = typecheck.checkEmail(req.body.email);
        password = typecheck.isValidString(req.body.password);
        let player = await authenticatePlayer(email, password);
        req.session.player = player;
        return res.redirect("/");
    } catch (e) {
        return res.status(401).json({status: 401, error: "Either the email or password provided are invalid."});
    }
});
