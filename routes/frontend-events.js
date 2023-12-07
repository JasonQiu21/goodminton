import { Router } from "express";
import * as typecheck from "../typecheck.js";
const router = Router();

router.route("/").get(async (req, res) => {
  try {
    return res.render("allEvents", { user: req.session?.player });
  } catch (e) {
    return res.render("error", { user: req.session?.player, error: e.error });
  }
});

export default router;
