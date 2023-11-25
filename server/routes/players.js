import { Router } from 'express';
const router = Router();
import * as playerFunctions from '../data/players.js';
import * as helperFunctions from '../data/typecheck.js';

router
    .route('/')
    .get(async (req, res) => {
        //code here for GET
        try {
            const playerList = await playerFunctions.getAllPlayers();
            res.json(playerList);
        } catch(e) {
            res.status(500).json({error: e});
        }
    })
    .post(async (req, res) => {
        //code here for POST
        const body = req.body;
        try {
            if (!body.playerName) throw { status: 400, error: "Missing playerName" };
            if (!body.email) throw { status: 400, error: "Missing email" };
            if (!body.password) throw { status: 400, error: "Missing password" };
        } catch(e) {
            return res
            .status(400)
            .json({error: e});
        }
        try {
            await playerFunctions.createNewPlayer(
                body.playerName, body.email, body.password
            );
            res.json({"status": "ok"});
        } catch(e) {
            return res
            .status(500)
            .json({error: e});
        }
    });

export default router;

/*
Schema for Player:

{
    "id": new ObjectId(),
    "name": string,
    "picture" string (filepath),
    "email": string (can be null),
    "phone": string (can be null),
    "rating1": float -- singles rating,
    "rating2": float -- doubles rating,
}*/