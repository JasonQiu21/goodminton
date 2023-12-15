import express from 'express';
const app = express();
import configRoutes from "./routes/index.js";
import session from "express-session";
import {
  authenticateAdmin,
  authenticatePlayer,
  checkPlayerIdAgainstRequestBody,
  checkLoggedOut,
} from "./middleware/auth.js";

const port = 3000;
const debug = true;
import exphbs from "express-handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";

/*
TODO:
- Build out routes
*/

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
    cookie: { maxAge: 60000 },
  })
);

if (debug) {
  app.use("/", (req, res, next) => {
    console.log(
      `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.player
        ? "User is authenticated as"
        : "User not authenticated"
      } ${req.session.player ? req.session.player.role : ""})`
    );
    return next();
  });
}

const adminRoutes = ["/createEvent"];
adminRoutes.forEach((route) => app.use(route, authenticateAdmin));

const adminRoutesNotGet = ["/api/events/", "/api/events/:id"];
adminRoutesNotGet.forEach((route) => {
  app.post(route, authenticateAdmin);
  app.delete(route, authenticateAdmin);
  app.patch(route, authenticateAdmin);
});

const playerRoutes = ["/logout", "/api/events/reserve/*"];
playerRoutes.forEach((route) => app.use(route, authenticatePlayer));


const samePlayerIdRoutes = ["/api/events/reserve/*"];
samePlayerIdRoutes.forEach((route) =>
  app.use(route, checkPlayerIdAgainstRequestBody)
);

const samePlayerRoutesNotGet = ["/api/players/:playerId"];
samePlayerRoutesNotGet.forEach((route) => {
  app.post(route, checkPlayerIdAgainstRequestBody);
  app.delete(route, checkPlayerIdAgainstRequestBody);
  app.patch(route, checkPlayerIdAgainstRequestBody);
});

const loggedOutRoutes = ["/login", "/register"];
loggedOutRoutes.forEach((route) => {
  app.use(route, checkLoggedOut);
});

configRoutes(app);

app.listen(3000, async () => {

  const event = await getEvent('657a6c37dfa162a30ff80ea0');
  const matches = await generateMatches(event, { name: "Single Elimination" });

  console.log(matches);
  console.log("Goodminton server running on http://localhost:3000");
});
