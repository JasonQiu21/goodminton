import { Router } from "express";
import * as typecheck from "../typecheck.js";
import { getEvent } from "../data/events.js";
const router = Router();

router.route("/").get(async (req, res) => {
  try {
    return res.render("allEvents", {
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin"
    });
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.session?.player?._id,
      error: e.error,
      isAdmin: req.session?.player?.role === "admin"
    });
  }
});

router.route("/:id").get(async (req, res) => {
  try {
    const event = await getEvent(req.params.id)
    console.log(event);
    const eventDate = new Date(event.date * 1000);
    event.date = eventDate.toDateString();
    event.time = eventDate.toTimeString();
    for (let i = 0; i < event.reservations.length; i++) {
      const reservationTime = new Date(event.reservations[i].time * 1000);
      event.reservations[i].timeStamp = event.reservations[i].time;
      event.reservations[i].date = reservationTime.toDateString();
      event.reservations[i].time = reservationTime.toTimeString();
      event.reservations[i].isFull = event.reservations[i].players.length===event.reservations[i].max;
    }
    event.user = req.session?.player;
    event.id = req.session?.player?._id;
    event.isPractice = event.eventType == "practice";
    return res.render("event", event);
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.sesion?.player?._id,
      error: e.error,
    });
  }
});

export default router;
