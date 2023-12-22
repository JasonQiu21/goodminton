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
      let id = req.body.id;
      let matchId = req.body.matchId;
      let seeded = req.body.seeded ? req.body.seeded : false;
      let team1score = req.body.team1score;
      let team2score = req.body.team2score;
      let scores = [team1score, team2score];
      let winner = req.body.winner;

      if (req.body.elimBracket) {
        let id2 = req.body.id2;
        let bracket = await startTournament(id2, seeded);
        return res.redirect("/events/" + id2);
      } else if (req.body.swissRound) {
        let id3 = req.body.id3;
        let bracket = await generateSwissRound(id3);
        return res.redirect("/events/" + id3);
      } else if (req.body.topCut) {
        let id4 = req.body.id4;
        let bracket = await topCut(id4);
        return res.redirect("/events/" + id4);
      } else {
        let match = await submitScores(id, matchId, scores, winner);
        return res.redirect("/events/" + id);
      }

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
      if (!req.params.id) throw { status: 400, error: "No id" };
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
      if (!playerId || !eventId)
        throw { status: 400, error: "PlayerID or EventID missing" };
      typecheck.stringToOid(playerId);
      typecheck.stringToOid(eventId);
      const info = await createReservation(playerId, eventId, time);
      return res.json(info);
    } catch (e) {
      if (e.status) return res.status(e.status).json(e);
      console.log(e);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
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
    } catch (e) {
      if (e.status) return res.status(e.status).json(e);
      console.log(e);
      return res
        .status(500)
        .json({ status: 500, error: "An Internal Server Error Occurred" });
    }
  });

router.route("/:id/generateBracket").post(async (req, res) => {
  try {
    if (!req.params.id) throw { status: 400, error: "No event ID provided." };
    if (!req.body.seeded)
      throw { status: 400, error: "Seeded value not provided." };
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
});

router.route("/:id/generateSwissRound").post(async (req, res) => {
  try {
    if (!req.params.id) throw { status: 400, error: "No event ID provided." };
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
});

router.route("/:id/topCut").post(async (req, res) => {
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
});

router.route("/:id/standings").get(async (req, res) => {
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
    } catch (e) {
      if (!e.status) {
        console.log(`[Error on GET events/:id/matches/:matchId]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.body.winner && typeof req.body.winner !== "boolean")
        throw { status: 400, error: "No winner provided." };
      if (!req.body.scores) throw { status: 400, error: "No score provided." };
      let match = await submitScores(
        req.params.id,
        parseInt(req.params.matchId),
        req.body.scores,
        req.body.winner
      );
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
  });

export default router;
