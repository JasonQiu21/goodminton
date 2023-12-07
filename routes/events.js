import { Router } from "express";
import { createEvent, getAllEvents, getEvent, updateEvent, deleteEvent, createReservation, deleteReservation } from "../data/events.js";
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
      let event = await updateEvent(req.params.id, req.body);
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


export default router;