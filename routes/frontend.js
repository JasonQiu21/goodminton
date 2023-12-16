import { Router } from "express";
import * as typecheck from "../typecheck.js";
const router = Router();

router
    .route('/createEvent')
    .get(async(req, res) => {
        try {
            res.render('createEvent');
        }catch(e) {
            res.render("error");
        }
    })

export default router;