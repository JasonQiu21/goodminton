
import express from "express";
import configRoutes from "./routes/index.js";
import session from "express-session";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authenticateAdmin, authenticatePlayer } from "./middleware/auth.js";
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv'
import cors from 'cors';

dotenv.config()

const debug = true;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + "/public");

const app = express();

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "AuthState",
    secret: "Goodminton is good!",
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({
      mongoUrl: 'mongodb://localhost:27017/goodminton',
      ttl: 7 * 24 * 60 * 60, //7 days
      autoRemove: 'native'
    })
  })
);

app.use(cors())

app.use("/", (req, res, next) => {
  console.log(
    `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.player
      ? "User authenticated as"
      : "User not authenticated"
    } ${req.session.player ? req.session.player.role : ""})`
  );
  return next();
});


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

const playerRoutesNotGet = ["/api/players/:playerId"];
playerRoutesNotGet.forEach((route) => {
  app.post(route, authenticatePlayer);
  app.patch(route, authenticatePlayer);
  app.delete(route, authenticatePlayer);
});

configRoutes(app);

app.listen(process.env.PORT, () => {
  console.log(`Goodminton server running on http://localhost:${process.env.PORT}`);
});
