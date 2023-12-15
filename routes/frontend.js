import { Router } from "express";
import * as typecheck from '../typecheck.js';
const router = Router();

router
    .route("/events")
    .get(async(req, res) => {
        try {
            return res.render('allEvents');
        } catch(e) {
            return res.render('error');
        }

    })

export default router;
