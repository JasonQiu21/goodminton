import express from "express";
const app = express();
import configRoutes from './routes/index.js';
import session from "express-session";
import { authenticateAdmin, authenticatePlayer, checkPlayerIdAgainstRequestBody } from './middleware/auth.js';

const port = 3000;
const debug = true;
import exphbs from "express-handlebars";

/*
TODO:
- Build out routes
*/

app.use("/public", express.static("public"));

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

app.engine("handlebars", exphbs.engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

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
      `[${new Date().toUTCString()}]: ${req.method} ${req.originalUrl} (${req.session.user ? "User is authenticated as" : "User not authenticated"
      } ${req.session.user ? req.session.user.role : ""})`
    );
    return next();
  });
}

const adminRoutes = [];
adminRoutes.forEach((route) => app.use(route, authenticateAdmin));

const playerRoutes = [];
playerRoutes.forEach((route) => app.use(route, authenticatePlayer));

const samePlayerIdRoutes = [];
samePlayerIdRoutes.forEach((route) =>
  app.use(route, checkPlayerIdAgainstRequestBody)
);

configRoutes(app);

app.listen(port, () => {
  console.log(`Goodminton server running on http://localhost:${port}`);
});
