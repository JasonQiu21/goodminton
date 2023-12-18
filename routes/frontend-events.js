import { Router } from "express";
import * as typecheck from "../typecheck.js";
import { getEvent, submitScores } from "../data/events.js";
import { getReservations } from "../data/players.js";
import { time } from "console";

const router = Router();

router.route("/").get(async (req, res) => {
  try {
    return res.render("allEvents", {
      title: "All Events",
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin",
    });
  } catch (e) {
    return res.render("error", {
      title: "Error",
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
    const isLoggedIn = req.session?.player ? true : false;
    if (event?.tournamentType === "round robin") {

      // get timeSlot
      const timeStamp = event.reservations[0].time;
      // check if user is in timeSlot
      let inTimeslot = false;

      if (isLoggedIn) {
        event.reservations[0].players.forEach((player) => {
          if (player._id.toString() === req.session?.player?._id) {
            inTimeslot = true;
          }
        });
      }

      return res.render("roundrobin", {
        title: event.name,
        user: req.session?.player,
        id: req.session?.player?._id,
        isAdmin: req.session?.player?.role === "admin",
        loggedIn: isLoggedIn,
        timeStamp: timeStamp,
        inTimeslot: inTimeslot,
      });
    }
    else if (event?.tournamentType === "swiss") {
      // get timeSlot
      const timeStamp = event.reservations[0].time;
      // check if user is in timeSlot
      let inTimeslot = false;

      if (isLoggedIn) {
        event.reservations[0].players.forEach((player) => {
          if (player._id.toString() === req.session?.player?._id) {
            inTimeslot = true;
          }
        });
      }

      return res.render("swiss", {
        title: event.name,
        user: req.session?.player,
        id: req.session?.player?._id,
        isAdmin: req.session?.player?.role === "admin",
        loggedIn: isLoggedIn,
        timeStamp: timeStamp,
        inTimeslot: inTimeslot,
      });
    }
    else if (event?.tournamentType === "swiss") {
      return res.render("swiss", {
        user: req.session?.player,
        id: req.session?.player?._id,
        isAdmin: req.session?.player?.role === "admin"
      });
    }

    var playerReservations = [];
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
      event.reservations[i].timeStamped = reservationTime.toTimeString();
      event.reservations[i].isFull =
        event.reservations[i].players.length === event.reservations[i].max;
    }
    event.title = event.name;
    event.user = req.session?.player;
    event.id = req.session?.player?._id;
    event.isPractice = event.eventType == "practice";
    event.isSingleElim = event.tournamentType == "single elim";
    event.isDoubleElim = event.tournamentType == "double elim";
    event.isAdmin = req.session?.player?.role === "admin";
    if (event.isPractice) return res.render("event", event);

    const timeStamp = event.reservations[0].time;
    // check if user is in timeSlot
    let inTimeslot = false;
    if (isLoggedIn) {
      event.reservations[0].players.forEach((player) => {
        if (player._id.toString() === req.session?.player?._id) {
          inTimeslot = true;
        }
      });
    }

    event.loggedIn = isLoggedIn;
    event.timeStamp = timeStamp;
    event.inTimeslot = inTimeslot;

    if (event.isSingleElim) {
      for (let round in event.matches) {
        for (let matchIndex of event.matches[round]) {
          if (matchIndex.winner == 1) {
            matchIndex.winner1 = true;
            matchIndex.winner2 = false;
          } else if (matchIndex.winner == 2) {
            matchIndex.winner1 = false;
            matchIndex.winner2 = true;
          }
        }
      }


      return res.render("bracket", event);
    }
    if (event.isDoubleElim) {
      let winnerBracket = {};
      let loserBracket = {};
      for (let round in event.matches) {
        if (round.includes("winners") || round.includes("finals")) {
          winnerBracket[round] = event.matches[round];
        } else {
          loserBracket[round] = event.matches[round];
        }
        for (let matchIndex of event.matches[round]) {
          if (matchIndex.winner == 1) {
            matchIndex.winner1 = true;
            matchIndex.winner2 = false;
          } else if (matchIndex.winner == 2) {
            matchIndex.winner1 = false;
            matchIndex.winner2 = true;
          }
        }
      }
      event.winnerBracket = winnerBracket;
      event.loserBracket = loserBracket;
      console.log(event);
      return res.render("doubleElim", event);
    }
  } catch (e) {
    return res.render("error", {
      title: "Error",
      user: req.session?.player,
      id: req.session?.player?._id,
      error: e.error,
    });
  }
});

router.route("/:id/scoreSubmissions")
  .get(async (req, res) => {
    try {
      const event = await getEvent(req.params.id)
      const isLoggedIn = req.session?.player;
      if (!isLoggedIn) {
        return res.redirect("/login");
      }

      //get the event matches
      let unfinishedMatches = [];

      for (let round in event.matches) {
        for (let match1 of event.matches[round]) {
          if (match1.winner === 0 && !match1.byeround && match1.team1 !== null && match1.team2 !== null) {
            console.log(match1);
            match1.team1 = (match1.team1.length > 1) ? match1.team1[0].playerName + " & " + match1.team1[1].playerName : match1.team1[0].playerName;
            match1.team2 = (match1.team2.length > 1) ? match1.team2[0].playerName + " & " + match1.team2[1].playerName : match1.team2[0].playerName;
            match1.in_round = round;
            unfinishedMatches.push(match1);
          }
        }
      }

      return res.render("scoreSubmissions", { user: req.session?.player, id: req.session?.player?._id, eventId: req.params.id, matchData: unfinishedMatches });
    } catch (e) {
      console.log(e);
      return res.render("error", {
        user: req.session?.player,
        id: req.session?.player?._id,
        error: e.error,
      });
    }
  }).post(async (req, res) => {
    try {
      let id = req.body.id;
      let matchId = req.body.matchId;
      let team1score = req.body.team1score;
      let team2score = req.body.team2score;
      let scores = [team1score, team2score];
      let winner = req.body.winner;
      let match = await submitScores(id, matchId, scores, winner);
      res.redirect("/events/" + id);
    } catch (e) {
      console.log(e);
      return res.render("error", {
        user: req.session?.player,
        id: req.session?.player?._id,
        error: e.error,
      });
    }
  });

export default router;
