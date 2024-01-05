import { Router } from "express";
const router = Router();
import * as playerFunctions from "../data/players.js";
import * as helperFunctions from "../typecheck.js";
import xss from "xss";

router
  .route("/")
  .get(async (req, res) => {
    //code here for GET
    try {
      const playerList = await playerFunctions.getAllPlayers();
      res.json(playerList);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  })
  .post(async (req, res) => {
    //code here for POST
    const body = req.body;
    try {
      if (!body.playerName) throw { status: 400, error: "Missing playerName" };
      if (!body.email) throw { status: 400, error: "Missing email" };
      if (!body.password) throw { status: 400, error: "Missing password" };
      if (body.phone) {
        body.phone = helperFunctions.isValidString(phone);
        if (
          !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone)
        )
          throw { status: 400, error: "Bad phone number" };
      }
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
    try {
      await playerFunctions.createNewPlayer(
        xss(body.playerName),
        xss(body.email),
        xss(body.password),
        body.phone ? body.phone : null
      );
      res.json({ status: 200, created: true });
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  });

router
  .route("/:playerId")
  .get(async (req, res) => {
    //GET
    try {
      var id = helperFunctions.isValidId(req.params.playerId);
      var player = await playerFunctions.getPlayer(id);
      player["matchhistory"] = await playerFunctions.getAllMatches(id);
      return res.json(player);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  })
  .patch(async (req, res) => {
    try {
      const body = helperFunctions.isValidPlayer(req.body, true);
      const id = req.params.playerId;
      if (req.session?.player._id !== id) return res.status(403).json({ status: 403, error: "Forbidden." });
      Object.keys(body).forEach(key => {
        if (typeof body[key] === "string")
          body[key] = xss(body[key])
      });

      if (req.session?.player?.role !== "admin") {
        delete body?.singlesRating;
        delete body?.doublesRating;
      }
      let player = await playerFunctions.updatePlayer(id, body);
      return res.json(player);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  })
  .delete(async (req, res) => {
    try {
      let id = helperFunctions.isValidId(req.params.playerId);
      if (req.session?.player._id !== id) return res.status(403).json({ status: 403, error: "Forbidden." });
      let player = await playerFunctions.removePlayer(id);
      return res.json(player);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  });

router.route("/reservations/:playerId").get(async (req, res) => {
  try {
    let id = helperFunctions.isValidId(req.params.playerId);
    let events = await playerFunctions.getReservations(id);
    return res.json(events);
  } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
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
