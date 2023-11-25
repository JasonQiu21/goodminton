import { Router } from 'express';
const router = Router();
import * as playerFunctions from '../data/players.js';

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
    // .post(async (req, res) => {
    //     //code here for POST
    // });

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