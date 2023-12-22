
import express from "express";
import configRoutes from "./routes/index.js";
import session from "express-session";
import exphbs from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";


import {
  authenticateAdmin, authenticatePlayer, checkPlayerIdAgainstRequestBody, checkLoggedOut, addPlayerId,
} from "./middleware/auth.js";

const port = 3000;
const debug = true;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + "/public");

const app = express();

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    helpers: {
      inc: function (value, options) {
        return parseInt(value) + 1;
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    name: "AuthState",
    secret: "Goodminton",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 604800000 }, // 1 week
  })
);


app.use("/", (req, res, next) => {
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.player
      ? "User authenticated as"
      : "User not authenticated"
    } ${req.session.player ? req.session.player.role : ""})`
  );
  return next();
});


const adminRoutes = ["/createEvent", "/api/events/:id/scoreSubmissions", "/events/:id/scoreSubmissions", "/api/events/:id/matches/:matchId"];
adminRoutes.forEach((route) => app.use(route, authenticateAdmin));

const adminRoutesNotGet = ["/api/events/", "/api/events/:id"];
adminRoutesNotGet.forEach((route) => {
  app.post(route, authenticateAdmin);
  app.delete(route, authenticateAdmin);
  app.patch(route, authenticateAdmin);
});

const playerRoutes = ["/logout", "/api/events/reserve/*"];
playerRoutes.forEach((route) => app.use(route, authenticatePlayer));

const playerRoutesNotGet = ["/api/players/:playerId"];
playerRoutesNotGet.forEach((route) => {
  app.post(route, authenticatePlayer);
  app.patch(route, authenticatePlayer);
  app.delete(route, authenticatePlayer);
});


const addPlayerIdRoutes = ["/api/events/reserve/*"];
addPlayerIdRoutes.forEach((route) =>
  app.use(route, addPlayerId)
);

const loggedOutRoutes = ["/login", "/register"];
loggedOutRoutes.forEach((route) => {
  app.use(route, checkLoggedOut);
});

configRoutes(app);

app.listen(port, () => {
  console.log(`Goodminton server running on http://localhost:${port}`);
});
