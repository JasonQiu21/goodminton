import { Router } from "express";
import * as typecheck from "../typecheck.js";
const router = Router();

router
    .route('/createEvent')
    .get(async(req, res) => {
        let role;
        if (req.session.user) {
            role = req.session.role === "admin";

        }
        try {
            res.render('createEvent', {isAdmin: role});
        }catch(e) {
            res.render("error");
        }
    })

export default router;