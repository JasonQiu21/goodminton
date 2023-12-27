import { Router } from "express";
import { authenticatePlayer, createNewPlayer } from "../data/players.js";
import { generateSessionId } from "../data/auth.js"
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/login")
    .post(async (req, res) => {
        try {
            let email = typecheck.checkEmail(req.body.email);
            let password = typecheck.isValidString(req.body.password);
            let player = await authenticatePlayer(email, password);

            req.session.player = player;
            req.session.sessionId = generateSessionId()

            //save to mongodb
            req.session.save(err => { if (err) return res.status(500).json({ status: 500, error: "An internal error occured while saving login session." }) })

            return res.json({ player: player, sessionId: req.session.sessionId })
        } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
    });

router.route("/logout").get(async (req, res) => {
    req.session.destroy(err => { if (err) res.status(500).json({ status: 500, error: "An internal error occured while saving login session." }) });
    res.json({ status: 200, message: "Logout successful." })
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
