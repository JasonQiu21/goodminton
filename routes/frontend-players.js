import { Router } from "express";
import * as playerFunctions from "../data/players.js";
import * as eventFunctions from "../data/events.js";
import * as typecheck from "../typecheck.js";

const router = Router();

router.route("/:playerid").get(async (req, res) => {
  try {
    let id = typecheck.isValidId(req.params.playerid);
    let player = await playerFunctions.getPlayer(id);
    const matchData = await playerFunctions.getAllMatches(id);
    for (let i = 0; i < matchData.length; i++) {
      let team1 = matchData[i].team1;
      let team2 = matchData[i].team2;
      let team1Name = "";
      let team2Name = "";
      for (let j = 0; j < team1.length; j++) {
        matchData[i].team1[j]._id = matchData[i].team1[j]._id.toString();
        team1Name += team1[j].playerName + " and ";
      }
      for (let j = 0; j < team2.length; j++) {
        matchData[i].team2[j]._id = matchData[i].team2[j]._id.toString();
        team2Name += team2[j].playerName + " and ";
      }
      team1Name = team1Name.slice(0, -5);
      team2Name = team2Name.slice(0, -5);
      matchData[i].team1 = team1Name;
      matchData[i].team2 = team2Name;
      matchData[i].team1Score = matchData[i].score[0];
      matchData[i].team2Score = matchData[i].score[1];
      const event = await eventFunctions.getEvent(matchData[i].eventId);
      matchData[i].eventName = event.name;
      matchData[i].eventTime = new Date(event.date * 1000).toUTCString();
      // check what team the user is on
      let userTeam = 1;
      for (let j = 0; j < team2.length; j++) {
        if (team2[j]._id === id) {
          userTeam = 2;
          break;
        }
      }
      matchData[i].didWin = matchData[i].winner === userTeam;
    }
    const playerName = player.playerName;
    return res.render("profile", {
      player: player,
      owner: req.session?.player?._id == id,
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin",
      title: playerName,
      matches: matchData
    });
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin"
    });
  }
});

router.route("/reservations/:playerid").get(async (req, res) => {
  try {
    let id = typecheck.isValidId(req.params.playerid);
    let events = [];
    try{
      events = await playerFunctions.getReservations(id);
    } catch (e) {
      if(e?.status !== 404) throw e;
    }
    for (let i = 0; i < events.length; i++) {
      const eventTime = new Date(events[i].time * 1000);
      events[i].time = eventTime.toDateString() + " @ " + eventTime.toTimeString();
    }

    return res.render("reservations", {
      user: req.session?.player,
      title: "Reservations",
      id: req.session?.player?._id,
      reservations: events,
      isAdmin: req.session?.player?.role === "admin"
    });
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      title: "Error",
      id: req.session?.player?._id,
      error: e.error,
      
    });
  }
});

export default router;
