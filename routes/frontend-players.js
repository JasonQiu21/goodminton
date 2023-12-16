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
      owner: req.session?.player._id == id,
      user: req.session?.player,
      id: req.session?.player._id,
    });
  } catch (e) {
    return res.render("forbidden", { user: req.session?.player });
  }
});

export default router;
