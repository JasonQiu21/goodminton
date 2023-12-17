import { Router } from "express";
import * as typecheck from "../typecheck.js";
import { getEvent } from "../data/events.js";
import { getReservations } from "../data/players.js";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    return res.render("allEvents", {
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin",
    });
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.session?.player?._id,
      error: e.error,
      isAdmin: req.session?.player?.role === "admin",
    });
  }
});

/* getReservations(playerId)
[
  {
    _id: '657e45b9d6da26c30fd41289',
    name: '11/28/2023 Practice',
    time: 1701207000
  }
]
*/

router.route("/:id").get(async (req, res) => {
  try {
    const event = await getEvent(req.params.id);
    var playerReservations = [];
    const isLoggedIn = req.session?.player;
    if (req.session?.player) {
      playerReservations = await getReservations(req.session?.player?._id);
    }
    let inEvent = playerReservations.some(
      (event) => event._id === req.params.id
    );
    var inEventTime = -1;
    if (inEvent) {
      inEventTime = playerReservations.filter(
        (event) => event._id === req.params.id
      )[0].time;
    }
    if (!isLoggedIn) {
      inEvent = true;
    }
    const eventDate = new Date(event.date * 1000);
    event.date = eventDate.toDateString();
    event.time = eventDate.toTimeString();
    for (let i = 0; i < event.reservations.length; i++) {
      const reservationTime = new Date(event.reservations[i].time * 1000);
      event.reservations[i].timeStamp = event.reservations[i].time;
      event.reservations[i].inEvent = inEvent;
      if (event.reservations[i].time === inEventTime) {
        // might need to multiply by 1000
        event.reservations[i].inTimeslot = true;
      } else {
        event.reservations[i].inTimeslot = false;
      }
      event.reservations[i].date = reservationTime.toDateString();
      event.reservations[i].time = reservationTime.toTimeString();
      event.reservations[i].isFull = event.reservations[i].players.length === event.reservations[i].max;
    }
    event.user = req.session?.player;
    event.id = req.session?.player?._id;
    event.isPractice = event.eventType == "practice";
    event.isSingleElim = event.eventType == "Single Elimination Tournament";
    if (event.isPractice) return res.render("event", event);
    if (event.isSingleElim) return res.render("bracket", event);
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.session?.player?._id,
      error: e.error,
    });
  }
});

export default router;
