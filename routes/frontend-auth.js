import { Router } from "express";
import { authenticatePlayer } from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/").get(async (req, res) => {
  return res.render("home", { user: req.session?.player });
});
router
  .route("/login")
  .get(async (req, res) => {
    return res.render("login", { user: req.session?.player });
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
      return res.render("login", { user: req.session?.player, error: e.error });
    }
  });

router.route("/logout").get(async (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

export default router;
