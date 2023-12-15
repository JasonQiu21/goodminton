import { Router } from "express";
import {
  createEvent,
  getAllEvents,
  getEvent,
  updateEvent,
  deleteEvent,
} from "../data/events.js";
import { authenticatePlayer } from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router
  .route("/login")
  .get(async (req, res) => {
    res.render("login", { title: "Login", user: req.session?.player });
  })
  .post(async (req, res) => {
    console.log(req.body);
    try {
      let email = typecheck.checkEmail(req.body.email);
      let password = typecheck.isValidString(req.body.password);
      let player = await authenticatePlayer(email, password);
      req.session.player = player;
      res.redirect("/");
    } catch (e) {
      return res.status(401).json({
        status: 401,
        error: "Either the email or password provided are invalid.",
      });
    }
  });

router
  .route("/register")
  .get(async (req, res) => {
    res.render("register", { title: "Register" });
  })
  .post(async (req, res) => {});

export default router;
