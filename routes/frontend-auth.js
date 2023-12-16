import { Router } from "express";
import { authenticatePlayer } from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/").get(async (req, res) => {
  return res.render("home", {
    user: req.session?.player,
    id: req.session?.player?._id,
  });
});
router
  .route("/login")
  .get(async (req, res) => {
    return res.render("login", {
      user: req.session?.player,
      id: req.session?.player?._id,
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
        user: req.session?.player,
        error: e.error,
        id: req.session?.player?._id,
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
      user: req.session?.player,
      id: req.session?.player?._id,
    });
  })
  .post(async (req, res) => {
    try {
      let playerName = typecheck.isValidString(req.body.playerName);
      let email = typecheck.checkEmail(req.body.email);
      let password = typecheck.isValidString(req.body.password);
      let player = await createNewPlayer(playerName, email, password);
      return res.redirect("/players/" + player._id.toString());
    } catch (e) {
      return res.render("register", {
        user: req.session?.player,
        error: e.error,
        id: req.session?.player?._id,
      });
    }
  });

export default router;
