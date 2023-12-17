import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  createReservation,
  deleteReservation,
} from "../data/events.js";
import * as typecheck from "../typecheck.js";
const router = Router();

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
      const expectedKeys = ["eventName", "eventDate", "eventType"];
      const params = [];
      expectedKeys.forEach((key) => {
        if (!Object.keys(req.body).includes(key))
          throw { status: 400, error: `Field '${key}' missing` };
        params.push(req.body[key]);
      });

      typecheck.isValidString(req.body.eventName, "Event Name");
      typecheck.isValidUnix(req.body.eventDate);
      const eventTypes = ["doublestournament", "singlestournament", "practice"];

      typecheck.isValidString(req.body.eventType, "Event Type").toLowerCase();
      if (!eventTypes.includes(req.body.eventType))
        throw { status: 400, error: "Invalid event type." };

      const createdEvent = await createEvent(...params);
      return res.json(createdEvent);
    } catch (e) {
      console.log(e);
      if (!e.status) {
        console.log(`[Error on POST events/]: ${e}`);
        return res
          .status(500)
          .json({ status: 500, error: "An Internal Server Error Occurred" });
      }
      return res.status(e.status).json(e);
    }
  });

router
  .route("/:id")
  .get(async (req, res) => {
    try {
      let event = await getEvent(req.params.id);
      return res.render("event", { event: event });
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
      const _id = typecheck.stringToOid(req.params.id);
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

export default router;
