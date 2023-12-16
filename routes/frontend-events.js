import { Router } from "express";
import * as typecheck from "../typecheck.js";
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
      id: req.session?.player?._id,
    });
  }
});

export default router;
