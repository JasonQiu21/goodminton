import { Router } from "express";
import * as playerFunctions from "../data/players.js";
import * as typecheck from "../typecheck.js";
const router = Router();

router
  .route("/:playerid")
  .get(async (req, res) => {
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
  })
  .post(async (req, res) => {
    let id = typecheck.isValidId(req.params.playerid);
    let player = await playerFunctions.getPlayer(id);
    let { username, email, password, confirmPassword, phoneNumber } = req.body;
    if (username != "") {
      try {
        username = typecheck.isValidString(username, "Username");
      } catch (e) {
        return res.status(400).json({ error: e });
      }
    } else {
      username = player.playerName;
    }
    if (email != "") {
      try {
        email = typecheck.checkEmail(email);
      } catch (e) {
        return res.status(400).json({ error: e });
      }
    } else {
      email = player.email;
    }
    if (password != "") {
      try {
        password = typecheck.isValidString(password, "Password");
      } catch (e) {
        return res.status(400).json({ error: e });
      }
    } else {
      password = player.password;
    }
    if (confirmPassword != "") {
      try {
        confirmPassword = typecheck.isValidString(
          confirmPassword,
          "Confirm Password"
        );
      } catch (e) {
        return res.status(400).json({ error: e });
      }
    } else {
      confirmPassword = player.password;
    }
    if (password !== confirmPassword)
      return res.status(400).json({ error: "Passwords do not match" });
    if (phoneNumber != "") {
      try {
        phoneNumber = typecheck.isValidString(phoneNumber, "Phone Number");
      } catch (e) {
        return res.status(400).json({ error: e });
      }
    } else {
      phoneNumber = player.phoneNumber;
    }
    try {
      await playerFunctions.updatePlayer(
        id,
        username,
        email,
        password,
        phoneNumber
      );
      return res.redirect("/players/" + _id);
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  });

export default router;
