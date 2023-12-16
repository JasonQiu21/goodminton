import express from "express";
const app = express();
import configRoutes from './routes/index.js';

import { getEvent } from './data/events.js';
import { generateMatches } from './data/eventgeneration.js';

/*
TODO:
- Build out routes
*/

app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(session({
    name: "AuthState",
    secret: "Goodminton",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 60000 },
}));

if (debug) {
    app.use("/", (req, res, next) => {
        console.log(
            `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.user ? "User is authenticated as" : "User not authenticated"
            } ${req.session.user ? req.session.user.role : ""})`
        );
        return next();
    });
}

const adminRoutes = [];
adminRoutes.forEach(route => app.use(route, authenticateAdmin));

const playerRoutes = [];
playerRoutes.forEach(route => app.use(route, authenticatePlayer));

const samePlayerIdRoutes = [];
samePlayerIdRoutes.forEach(route => app.use(route, checkPlayerIdAgainstRequestBody));

configRoutes(app);



app.listen(3000, async () => {
    console.log("Goodminton server running on http://localhost:3000");
});