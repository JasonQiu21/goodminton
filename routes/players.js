import { Router } from "express";
const router = Router();
import * as playerFunctions from "../data/players.js";
import * as helperFunctions from "../typecheck.js";

router
  .route("/")
  .get(async (req, res) => {
    //code here for GET
    try {
      const playerList = await playerFunctions.getAllPlayers();
      res.json(playerList);
    } catch (e) {
      console.log(`[Error on GET players/]: ${e}`);
      res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
  })
  .post(async (req, res) => {
    //code here for POST
    const body = req.body;
    try {
      if (!body.playerName) throw { status: 400, error: "Missing playerName" };
      if (!body.email) throw { status: 400, error: "Missing email" };
      if (!body.password) throw { status: 400, error: "Missing password" };
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json(e);
      }
      console.log(`[Error on POST players/]: ${e}`);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
    try {
      await playerFunctions.createNewPlayer(
        body.playerName,
        body.email,
        body.password
      );
      res.json({ status: 200, created: true });
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json(e);
      }
      console.log(`[Error on POST players/]: ${e}`);
      return res.status(500).json({ error: e });
    }
  });

router
  .route("/:playerId")
  .get(async (req, res) => {
    //GET
    let id, answer;
    try {
      id = helperFunctions.isValidId(req.params.playerId);
      answer = await playerFunctions.getPlayer(id);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json(e);
      }
      console.log(`[Error on GET players/:id]: ${e}`);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
    res.render("player", { player: answer });
    return res.json(answer);
  })
  .patch(async (req, res) => {
    const body = req.body;
    const id = req.params.playerId;
    let answer;
    try {
      answer = await playerFunctions.updatePlayer(id, body);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json(e);
      }
      console.log(`[Error on POST players/:id]: ${e}`);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
    return res.json(answer);
  })
  .delete(async (req, res) => {
    let id, answer;
    try {
      id = helperFunctions.isValidId(req.params.playerId);
      answer = await playerFunctions.removePlayer(id);
    } catch (e) {
      if (e.status) {
        return res.status(e.status).json(e);
      }
      console.log(`[Error on DELETE players/:id]: ${e}`);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
    res.json(answer);
  });

export default router;

/*
Schema for Player:

{
    "id": new ObjectId(),
    "playerName": string,
    "email": string,
    "password" string,
    "phone": string (can be null),
    "rating1": float -- singles rating,
    "rating2": float -- doubles rating,
}*/
