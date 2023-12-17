import { Router } from "express";
import { authenticatePlayer, createNewPlayer } from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/").get(async (req, res) => {
  return res.render("home", {
    title: "Goodminton",
    user: req.session?.player,
    id: req.session?.player?._id,
  });
});
router
  .route("/login")
  .get(async (req, res) => {
    return res.render("login", {
      title: "Login",
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin",
    });
  })
  .post(async (req, res) => {
    try {
      let email = typecheck.checkEmail(req.body.email);
      let password = typecheck.isValidString(req.body.password);
      let player = await authenticatePlayer(email, password);
      req.session.player = player;
      // console.log(req.session.player);
      return res.redirect("/players/" + player._id.toString());
    } catch (e) {
      return res.render("login", {
        title: "Login",
        user: req.session?.player,
        error: e.error,
        id: req.session?.player?._id,
        isAdmin: req.session?.player?.role === "admin",
      });
    }
  });

router.route("/logout").get(async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

router
  .route("/register")
  .get(async (req, res) => {
    return res.render("register", {
      title: "Register",
      user: req.session?.player,
      id: req.session?.player?._id,
      isAdmin: req.session?.player?.role === "admin",
    });
  })
  .post(async (req, res) => {
    try {
      let playerName = typecheck.isValidString(req.body.playerName);
      let email = typecheck.checkEmail(req.body.email);
      let password = typecheck.isValidString(req.body.password);
      let phoneNumber = null;
      if (req.body.phoneNumber != "") {
        phoneNumber = typecheck.isValidString(req.body.phoneNumber);
      }
      let player = await createNewPlayer(
        playerName,
        email,
        password,
        phoneNumber
      );
      return res.redirect("/login");
    } catch (e) {
      return res.render("register", {
        title: "Register",
        user: req.session?.player,
        error: e.error,
        id: req.session?.player?._id,
        isAdmin: req.session?.player?.role === "admin",
      });
    }
  });

router.route("/forbidden").get((req, res) => {
  res.status(403).render("error", {
    error: "Forbidden",
    user: req.session?.player,
    id: req.session?.player?._id,
  });
});

export default router;
