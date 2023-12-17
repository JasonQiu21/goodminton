import { Router } from "express";
import * as typecheck from "../typecheck.js";
import { getBracket } from "../data/events.js";
const router = Router();

router.route("/").get(async (req, res) => {
  try {
    return res.render("allEvents", {
      user: req.session?.player,
      id: req.session?.player?._id,
    });
  } catch (e) {
    return res.render("error", {
      user: req.session?.player,
      id: req.sesion?.player?._id,
      error: e.error,
    });
  }
});


router.route("/:id/bracket").get(async (req, res) => {
  try {
    let id = typecheck.isValidId(req.params.id);
    let bracket = await getBracket(id);
    return res.render("bracket", { user: req.session?.player, bracket: bracket });
  } catch (e) {
    return res.render("error", { user: req.session?.player, error: e.error });
  }
});

export default router;
