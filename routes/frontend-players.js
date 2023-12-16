import { Router } from "express";
import * as playerFunctions from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/:playerid").get(async (req, res) => {
  try {
    let id = typecheck.isValidId(req.params.playerid);
    let player = await playerFunctions.getPlayer(id);
    return res.render("profile", {
      player: player,
      owner: req.session?.player?._id == id,
      user: req.session?.player,
      id: req.session?.player?._id,
    });
  } catch (e) {
    return res.render("forbidden", {
      user: req.session?.player,
      id: req.session?.player?._id,
    });
  }
});

router.route("/reservations/:playerid").get(async (req, res) => {
  try {
    let id = typecheck.isValidId(req.params.playerid);
    let events = await playerFunctions.getReservations(id);
    for (let i = 0; i < events.length; i++) {
      const eventTime = new Date(events[i].date * 1000);
      events[i].time = eventTime.toDateString() + " @ " + eventTime.toTimeString();
    }

    return res.render("reservations", {
      user: req.session?.player,
      title: "Reservations",
      id: req.session?.player?._id,
      reservations: events,
    });
  } catch (e) {
    return res.render("error", {
      error: e.error,
    });
  }
});

export default router;
