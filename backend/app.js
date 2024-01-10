
import express from "express";
import configRoutes from "./routes/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { authenticatedPlayer } from './data/auth.js';
import { authenticateAdmin, authenticatePlayer } from "./middleware/auth.js";
import dotenv from 'dotenv'
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config()

const debug = true;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const staticDir = express.static(__dirname + "/public");

const app = express();

app.use("/public", staticDir);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({ credentials: true, origin: true }));

app.use("/", async (req, res, next) => {

  let logstr = `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl}`
  try {
    let loggedInPlayer = await authenticatedPlayer(req.cookies.sessionID);
    logstr += ` (Authenticated as | ${loggedInPlayer.playerName} | ${loggedInPlayer.role})`
  } catch (e) {
    logstr += ` (Not Authenticated)`
  }

  console.log(logstr);

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
