import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  createReservation,
  deleteReservation,
  startTournament,
  generateSwissRound,
  topCut,
  getMatch,
  getStandings,
  submitScores,
} from "../data/events.js";
import * as typecheck from "../typecheck.js";
const router = Router();
import xss from "xss";

router
  .route("/")
  .get(async (req, res) => {
    try {
      const events = await getAllEvents();
      return res.json(events);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on GET events/]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })
  .post(async (req, res) => {
    try {
      const expectedKeys = [
        "eventName",
        "eventDate",
        "eventType",
        "tournamentType",
        "eventCap"
      ];
      const params = [];
      expectedKeys.forEach((key) => {
        if (!Object.keys(req.body).includes(key))
          throw { status: 400, error: `Field '${key}' missing` };
        if (typeof req.body[key] === "string")
          req.body[key] = xss(req.body[key]);
        params.push(req.body[key]);
      });

      typecheck.isValidString(req.body.eventName, "Event Name");
      typecheck.isValidUnix(req.body.eventDate);
      const eventTypes = ["doubles tournament", "singles tournament", "practice"];
      const tournamentTypes = [
        "none",
        "single elim",
        "double elim",
        "round robin",
        "swiss",
      ];
      typecheck.isValidString(req.body.eventType, "Event Type").toLowerCase();
      if (!eventTypes.includes(req.body.eventType))
        throw { status: 400, error: "Invalid event type." };
      if (!tournamentTypes.includes(req.body.tournamentType))
        throw { status: 400, error: "Invalid tournament type." };

      typecheck.isFiniteNumber(req.body.eventCap, "Event Cap");

      const createdEvent = await createEvent(...params);
      return res.json(createdEvent);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      console.log(e);
      return res.status(e.status).json(e);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      let event = await getEvent(req.params.id);
      return res.json(event);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on GET events/:id]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })
  .post(async (req, res) => {
    try {
      let id = req.params.id;
      let seeded = req.body.seeded ? req.body.seeded : false;

      if (req.body.elimBracket) await startTournament(id, seeded);
      else if (req.body.swissRound) await generateSwissRound(id);
      else if (req.body.topCut) await topCut(id, req.body.topcutvalue);
      else await submitScores(id, req.body.matchId, [req.body.team1score, req.body.team2score], req.body.winner);

      return res.redirect(`/events/${id}`)
    } catch (e) {
      console.log(e);
      return res.render("error", {
        user: req.session?.player,
        id: req.session?.player?._id,
        error: e.error,
      });
    }
  })
  .patch(async (req, res) => {
    try {
      const _id = typecheck.stringToOid(req.params.id);
      const body = typecheck.isValidEvent(req.body, true);
      Object.keys(body).forEach((key) => {
        if (typeof body[key] === str) body[key] = xss(body[key]);
      });
      let event = await updateEvent(req.params.id, body);
      return res.json(event);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }

  })
  .delete(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No id" };
      let deletedEvent = await deleteEvent(req.params.id);
      return res.json(deletedEvent);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  });

router
  .route("/reserve/:id")
  .post(async (req, res) => {
    const playerId = req.body?.playerId;
    const eventId = req.params.id;
    const time = req.body?.time;
    // const court = body.court;
    try {
      if (!playerId || !eventId)
        throw { status: 400, error: "PlayerID or EventID missing" };
      typecheck.stringToOid(playerId);
      typecheck.stringToOid(eventId);
      const info = await createReservation(playerId, eventId, time);
      return res.json(info);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  })
  .delete(async (req, res) => {
    const playerId = req.body?.playerId;
    const eventId = req.params.id;
    try {
      if (!playerId || !eventId)
        throw { status: 400, error: "PlayerID or EventID missing" };
      typecheck.stringToOid(playerId);
      typecheck.stringToOid(eventId);
      const info = await deleteReservation(playerId, eventId);
      if (!info) throw { status: 500, error: "Could not delete reservation" };
      return res.json(info);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  });

router.route("/:id/standings").get(async (req, res) => {
  try {
    if (!req.params.id) throw { status: 400, error: "No event ID provided." };
    let standings = await getStandings(req.params.id);
    return res.json(standings);
  } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
});

router
  .route("/:id/matches/:matchId")
  .get(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No event ID provided." };
      if (!req.params.matchId)
        throw { status: 400, error: "No match ID provided." };
      let event = await getEvent(req.params.id);
      let match = await getMatch(event, req.params.matchId);
      return res.json(match);
    } catch (e) { return res.status(e.status ? e.status : 500).json(e.status ? e : { status: 500, error: "An Internal Server Error Occured." }); }
  })

export default router;
