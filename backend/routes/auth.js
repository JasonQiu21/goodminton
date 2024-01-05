import { Router } from "express";
import { authenticatePlayer, createNewPlayer } from "../data/players.js";
import {createSession, findSession, deleteSession} from '../data/session.js';
import * as typecheck from "../typecheck.js";

const router = Router();

router.route("/session").get(async (req, res) => {
    let player;
    try {
        player = await findSession(req.cookies.sessionID);
        return res.json({player: player});
    } catch {
        return res.json({player: null})
    }
})

router.route("/login")
    .post(async (req, res) => {
        try {
            let email = typecheck.checkEmail(req.body.email);
            let password = typecheck.isValidString(req.body.password);
            let player = await authenticatePlayer(email, password);

            let session = await createSession(player);
            return res.json({sessionID: session});

        } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
    });

router.route("/logout").get(async (req, res) => {
    try {
        let destroyed = destroySession(req.cookies.sessionID);
    } catch(e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
    return res.json({ status: 200, message: "Logout successful." })
});

router.route("/register")
    .post(async (req, res) => {
        try {
            let playerName = typecheck.isValidString(req.body.playerName);
            let email = typecheck.checkEmail(req.body.email);
            let password = typecheck.isValidString(req.body.password);
            let phoneNumber = null;
            if (req.body.phoneNumber != "") {
                phoneNumber = typecheck.isValidString(req.body.phoneNumber);
            }
            let player = await createNewPlayer(
                playerName,
                email,
                password,
                phoneNumber
            );
            return res.json(player);
        } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
    });

export default router;
