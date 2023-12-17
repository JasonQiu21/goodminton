import { Router } from "express";
import { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent, createReservation, deleteReservation, startTournament, generateSwissRound, topCut, getStandings, getMatch, submitScores } from "../data/events.js";
import * as typecheck from '../typecheck.js';
const router = Router();

router
  .route("/")
  .get(async (req, res) => {
    try {
      return res.json(await getAllEvents());
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
      const expectedKeys = ["eventName", "eventName", "eventType"];
      const params = [];
      expectedKeys.forEach((key) => {
        if (!Object.keys(req.body).includes(key))
          throw { status: 400, error: `Field '${key}' missing` };
        params.push(req.body[key]);
      });

      const createdEvent = await createEvent(...params);
      return res.json(createdEvent);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
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
  .patch(async (req, res) => {
    try {
      const id = typecheck.stringToOid(req.params.id);
      const body = typecheck.isValidEvent(req.body, true);
      let event = await updateEvent(req.params.id, body);
      return res.json(event);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on PATCH events/:id]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })
  .delete(async (req, res) => {
    try {
      let deletedEvent = await deleteEvent(req.params.id);
      return res.json(deletedEvent);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on DELETE events/:id]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  });
router
  .route("/reserve/:id")
  .post(async (req, res) => {
    const playerId = req.body?.playerId;
    const eventId = req.params.id;
    const time = req.body?.time;
    // const court = body.court;
    try {
      if (!playerId || !eventId) throw { status: 400, error: "PlayerID or EventID missing" };
      typecheck.stringToOid(playerId);
      typecheck.stringToOid(eventId);
      const info = await createReservation(playerId, eventId, time);
      return res.json(info);
    } catch (e) {
      if (e.status)
        return res
          .status(e.status)
          .json(e);
      console.log(e);
      return res.status(500).json({ status: 500, error: "An Internal Server Error Occurred" });
    }
  })
  .delete(async (req, res) => {
    const playerId = req.body?.playerId;
    const eventId = req.params.id;
    try {
      if (!playerId || !eventId) throw { status: 400, error: "PlayerID or EventID missing" };
      typecheck.stringToOid(playerId);
      typecheck.stringToOid(eventId);
      const info = await deleteReservation(playerId, eventId);
      if (!info) throw { status: 500, error: 'Could not delete reservation' };
      return res.json(info);
    } catch (e) {
      if (e.status)
        return res
          .status(e.status)
          .json(e);
      console.log(e);
      return res.status(500).json({ status: 500, error: "An Internal Server Error Occurred" });
    }
  })
router
  .route("/:id/generateBracket")
  .post(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No event ID provided." };
      if (!req.body.seeded) throw { status: 400, error: "Seeded value not provided." };
      let matches = await startTournament(req.params.id, req.body.seeded);
      return res.json(matches);

    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/:id/generateBracket]: ${e.stack}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })

router
  .route("/:id/generateSwissRound")
  .post(async (req, res) => {
    try {
      if (!req.body.id) throw { status: 400, error: "No event ID provided." };
      let matches = await generateSwissRound(req.params.id);
      return res.json(matches);

    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/:id/generateSwissRound]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })

router
  .route("/:id/topCut")
  .post(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No event ID provided." };
      if (!req.body.topCut) throw { status: 400, error: "No top cut provided." };

      let matches = await topCut(req.params.id, req.body.topCut);
      return res.json(matches);

    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/:id/topCut]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })

router
  .route("/:id/standings")
  .get(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No event ID provided." };
      let standings = await getStandings(req.params.id);
      return res.json(standings);

    } catch (e) {
      if (!e.status) {
        console.log(`[Error on GET events/:id/standings]: ${e.stack}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })

router
  .route("/:id/matches/:matchId")
  .get(async (req, res) => {
    try {
      if (!req.params.id) throw { status: 400, error: "No event ID provided." };
      if (!req.params.matchId) throw { status: 400, error: "No match ID provided." };
      let event = await getEvent(req.params.id);
      let match = await getMatch(event, matchId);
      return res.json(match);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on GET events/:id/matches/:matchId]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  }).post(async (req, res) => {
    try {
      if (!req.body.winner && typeof (req.body.winner) !== "boolean") throw { status: 400, error: "No winner provided." };
      if (!req.body.scores) throw { status: 400, error: "No score provided." };
      let match = await submitScores(req.params.id, parseInt(req.params.matchId), req.body.scores, req.body.winner);
      return res.json(match);
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on POST events/:id/matches/:matchId]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })



export default router;