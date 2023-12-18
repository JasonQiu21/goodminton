import { dbConnection, closeConnection } from "../config/mongoConnection.js";

import { events, players } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

import bcrypt from "bcrypt";
const saltRounds = 16;

const db = await dbConnection();
await db.dropDatabase();

const eventsCol = await events();
const playersCol = await players();

//NOTE: For BCrypt Hash, cost factor/salt rounds is set to 10.

let player1Pass = await bcrypt.hash("password1", saltRounds);

const player1 = await playersCol.insertOne({
  password: player1Pass, //password1
  playerName: "Jason Qiu",
  email: "jqiu21@stevens.edu",
  phone: null,
  role: "admin",
  singlesRating: 469,
  doublesRating: 902,
});

let player2Pass = await bcrypt.hash("password12", saltRounds);

const player2 = await playersCol.insertOne({
  password: player2Pass, //password12
  playerName: "Patrick Hill",
  email: "phill@stevens.edu",
  phone: "8484682000",
  role: "user",
  singlesRating: 800,
  doublesRating: 800,
});

let player3Pass = await bcrypt.hash("password123", saltRounds);

const player3 = await playersCol.insertOne({
  password: player3Pass, //password123
  playerName: "Jackey Yang",
  email: "jyang28@stevens.edu",
  phone: null,
  role: "admin",
  singlesRating: 500,
  doublesRating: 500,
});

let player4Pass = await bcrypt.hash("password1234", saltRounds);

const player4 = await playersCol.insertOne({
  password: player4Pass, //password1234
  playerName: "Eddison So",
  email: "eso69@stevens.edu",
  phone: "7322518976",
  role: "admin",
  singlesRating: 1200,
  doublesRating: 1200,
});

let player5Pass = await bcrypt.hash("password12345", saltRounds);

const player5 = await playersCol.insertOne({
  password: player5Pass, //password12345
  playerName: "Bryan Chan",
  email: "bchan4@stevens.edu",
  phone: "8484688222",
  role: "user",
  singlesRating: 800,
  doublesRating: 800,
});

let player6Pass = await bcrypt.hash("password6", saltRounds);

const player6 = await playersCol.insertOne({
  password: player6Pass, //password6
  playerName: "Britney Yang",
  email: "byang69@stevens.edu",
  phone: null,
  role: "admin",
  singlesRating: 200,
  doublesRating: 200,
});

let player7Pass = await bcrypt.hash("password67", saltRounds);

const player7 = await playersCol.insertOne({
  password: player7Pass, //password67
  playerName: "Jing Ngo",
  email: "jngo@stevens.edu",
  phone: "1111111111",
  role: "user",
  singlesRating: 230,
  doublesRating: 500,
});

let player8Pass = await bcrypt.hash("password67890", saltRounds);

const player8 = await playersCol.insertOne({
  password: player8Pass, //password67890
  playerName: "Aidan Haberman",
  email: "ahaberm@stevens.edu",
  role: "user",
  phone: null,
  singlesRating: 1300,
  doublesRating: 1000,
});

let player9Pass = await bcrypt.hash("password678901", saltRounds);

const player9 = await playersCol.insertOne({
  password: player9Pass, //password678901
  playerName: "John Doe",
  email: "john.doe@stevens.edu",
  role: "admin",
  phone: null,
  singlesRating: 2000,
  doublesRating: 2000,
});

const event1 = await eventsCol.insertOne({
  name: "12/26/2023 Practice",
  date: 1703628000, //November 24th, 2023 at 4PM
  eventType: "practice",
  matches: null,
  reservations: [
    {
      time: 1703628000,
      players: [
        { _id: player1.insertedId, playerName: "Jason Qiu" },
        { _id: player2.insertedId, playerName: "Patrick Hill" },
        { _id: player3.insertedId, playerName: "Jackey Yang" },
        { _id: player4.insertedId, playerName: "Eddison So" },
      ],
      max: 12,
    },
    {
      time: 1701207000,
      players: [{ _id: player6.insertedId, playerName: "Britney Yang" }],
      max: 12,
    },
    {
      time: 1701208800,
      players: [{ _id: player8.insertedId, playerName: "Aidan Haberman" }],
      max: 4,
    },
    {
      time: 1703633400,
      players: [],
      max: 4,
    },
  ],
});

const event2 = await eventsCol.insertOne({
  name: "Christmas Singles Tournament!",
  date: 1703530800, //December 8th, 2023 at 2PM
  eventType: "singles tournament",
  tournamentType: "double elim",
  matches: {
    "winners - 1": [
      {
        id: 1,
        team1: [
          {
            _id: new ObjectId("657f70b1bdd520024d394d59"),
            playerName: "John Doe",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 9,
        loser_to: 16,
      },
      {
        id: 2,
        team1: [
          {
            _id: new ObjectId("657f70a9bdd520024d394d57"),
            playerName: "Jing Ngo",
          },
        ],
        team2: [
          {
            _id: new ObjectId("657f70a6bdd520024d394d56"),
            playerName: "Britney Yang",
          },
        ],
        score: [21, 16],
        winner: 1,
        byeround: false,
        winner_to: 9,
        loser_to: 16,
      },
      {
        id: 3,
        team1: [
          {
            _id: new ObjectId("657f7097bdd520024d394d52"),
            playerName: "Patrick Hill",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 10,
        loser_to: 17,
      },
      {
        id: 4,
        team1: [
          {
            _id: new ObjectId("657f70a2bdd520024d394d55"),
            playerName: "Bryan Chan",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 10,
        loser_to: 17,
      },
      {
        id: 5,
        team1: [
          {
            _id: new ObjectId("657f70adbdd520024d394d58"),
            playerName: "Aidan Haberman",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 11,
        loser_to: 18,
      },
      {
        id: 6,
        team1: [
          {
            _id: new ObjectId("657f7094bdd520024d394d51"),
            playerName: "Jason Qiu",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 11,
        loser_to: 18,
      },
      {
        id: 7,
        team1: [
          {
            _id: new ObjectId("657f709fbdd520024d394d54"),
            playerName: "Eddison So",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 12,
        loser_to: 19,
      },
      {
        id: 8,
        team1: [
          {
            _id: new ObjectId("657f709bbdd520024d394d53"),
            playerName: "Jackey Yang",
          },
        ],
        team2: "bye",
        score: [0, 0],
        winner: 1,
        byeround: true,
        winner_to: 12,
        loser_to: 19,
      },
    ],
    "winners - 2": [
      {
        id: 9,
        team1: [
          {
            _id: new ObjectId("657f70b1bdd520024d394d59"),
            playerName: "John Doe",
          },
        ],
        team2: [
          {
            _id: new ObjectId("657f70a9bdd520024d394d57"),
            playerName: "Jing Ngo",
          },
        ],
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 13,
        loser_to: 20,
      },
      {
        id: 10,
        team1: [
          {
            _id: new ObjectId("657f7097bdd520024d394d52"),
            playerName: "Patrick Hill",
          },
        ],
        team2: [
          {
            _id: new ObjectId("657f70a2bdd520024d394d55"),
            playerName: "Bryan Chan",
          },
        ],
        score: [21, 0],
        winner: 1,
        byeround: false,
        winner_to: 13,
        loser_to: 21,
      },
      {
        id: 11,
        team1: [
          {
            _id: new ObjectId("657f70adbdd520024d394d58"),
            playerName: "Aidan Haberman",
          },
        ],
        team2: [
          {
            _id: new ObjectId("657f7094bdd520024d394d51"),
            playerName: "Jason Qiu",
          },
        ],
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 14,
        loser_to: 22,
      },
      {
        id: 12,
        team1: [
          {
            _id: new ObjectId("657f709fbdd520024d394d54"),
            playerName: "Eddison So",
          },
        ],
        team2: [
          {
            _id: new ObjectId("657f709bbdd520024d394d53"),
            playerName: "Jackey Yang",
          },
        ],
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 14,
        loser_to: 23,
      },
    ],
    "winners - 3": [
      {
        id: 13,
        team1: [
          {
            _id: new ObjectId("657f7097bdd520024d394d52"),
            playerName: "Patrick Hill",
          },
        ],
        team2: null,
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 15,
        loser_to: 26,
      },
      {
        id: 14,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 15,
        loser_to: 27,
      },
    ],
    "winners - 4": [
      {
        id: 15,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 30,
        loser_to: 29,
      },
    ],
    "losers - 1": [
      {
        id: 16,
        team1: "bye",
        team2: [
          {
            _id: new ObjectId("657f70a6bdd520024d394d56"),
            playerName: "Britney Yang",
          },
        ],
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 20,
        loser_to: null,
      },
      {
        id: 17,
        team1: "bye",
        team2: "bye",
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 21,
        loser_to: null,
      },
      {
        id: 18,
        team1: "bye",
        team2: "bye",
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 23,
        loser_to: null,
      },
      {
        id: 19,
        team1: "bye",
        team2: "bye",
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 24,
        loser_to: null,
      },
    ],
    "losers - 2": [
      {
        id: 20,
        team1: [
          {
            _id: new ObjectId("657f70a6bdd520024d394d56"),
            playerName: "Britney Yang",
          },
        ],
        team2: null,
        score: [0, 0],
        winner: 1,
        byeround: false,
        winner_to: 24,
        loser_to: null,
      },
      {
        id: 21,
        team1: "bye",
        team2: [
          {
            _id: new ObjectId("657f70a2bdd520024d394d55"),
            playerName: "Bryan Chan",
          },
        ],
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 24,
        loser_to: null,
      },
      {
        id: 22,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 0,
        byeround: false,
        winner_to: 25,
        loser_to: null,
      },
      {
        id: 23,
        team1: "bye",
        team2: null,
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 25,
        loser_to: null,
      },
    ],
    "losers - 3": [
      {
        id: 24,
        team1: "bye",
        team2: [
          {
            _id: new ObjectId("657f70a2bdd520024d394d55"),
            playerName: "Bryan Chan",
          },
        ],
        score: [0, 0],
        winner: 2,
        byeround: true,
        winner_to: 26,
        loser_to: null,
      },
      {
        id: 25,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 2,
        byeround: false,
        winner_to: 27,
        loser_to: null,
      },
    ],
    "losers - 4": [
      {
        id: 26,
        team1: [
          {
            _id: new ObjectId("657f70a2bdd520024d394d55"),
            playerName: "Bryan Chan",
          },
        ],
        team2: null,
        score: [0, 0],
        winner: 1,
        byeround: false,
        winner_to: 28,
        loser_to: null,
      },
      {
        id: 27,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 2,
        byeround: false,
        winner_to: 28,
        loser_to: null,
      },
    ],
    "losers - 5": [
      {
        id: 28,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 1,
        byeround: false,
        winner_to: 30,
        loser_to: null,
      },
    ],
    "losers - 6": [
      {
        id: 29,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 1,
        byeround: false,
        winner_to: 30,
        loser_to: null,
      },
    ],
    finals: [
      {
        id: 30,
        team1: null,
        team2: null,
        score: [0, 0],
        winner: 0,
        byeround: false,
      },
    ],
  },
  reservations: [
    {
      time: 1703530800,
      players: [
        { _id: player1.insertedId, playerName: "Jason Qiu" },
        { _id: player2.insertedId, playerName: "Patrick Hill" },
        { _id: player3.insertedId, playerName: "Jackey Yang" },
        { _id: player4.insertedId, playerName: "Eddison So" },
        { _id: player5.insertedId, playerName: "Bryan Chan" },
        { _id: player6.insertedId, playerName: "Britney Yang" },
        { _id: player7.insertedId, playerName: "Jing Ngo" },
        { _id: player8.insertedId, playerName: "Aidan Haberman" },
        { _id: player9.insertedId, playerName: "John Doe" },
      ],
      max: 20,
    },
  ],
});

const event3 = await eventsCol.insertOne({
  name: "2024 New Year's Round Robin",
  date: 1704135600, //November 28th, 2023 at 6PM
  eventType: "singles tournament",
  tournamentType: "round robin",
  matches: {},
  reservations: [
    {
      time: 1704135600,
      players: [
        { _id: new ObjectId(player1.insertedId), playerName: "Jason Qiu" },
        { _id: new ObjectId(player4.insertedId), playerName: "Eddison So" },
      ],
      max: 5,
    },
  ],
});

const event4 = await eventsCol.insertOne({
  name: "02/01/2024 Swiss Tournament",
  date: 1706814000, //November 28th, 2023 at 6PM
  eventType: "singles tournament",
  tournamentType: "swiss",
  matches: {},
  reservations: [
    {
      time: 1706814000,
      players: [
        { _id: player1.insertedId, playerName: "Jason Qiu" },
        { _id: player2.insertedId, playerName: "Patrick Hill" },
        { _id: player3.insertedId, playerName: "Jackey Yang" },
        { _id: player4.insertedId, playerName: "Eddison So" },
        { _id: player5.insertedId, playerName: "Bryan Chan" },
        { _id: player6.insertedId, playerName: "Britney Yang" },
        { _id: player7.insertedId, playerName: "Jing Ngo" },
        { _id: player8.insertedId, playerName: "Aidan Haberman" },
        { _id: player9.insertedId, playerName: "John Doe" },
      ],
      max: 5,
    },
  ],
});

const event5 = await eventsCol.insertOne({
  name: "02/01/2024 Singles Tournament",
  date: 1706814000, //November 28th, 2023 at 6PM
  eventType: "singles tournament",
  tournamentType: "single elim",
  matches: {},
  reservations: [
    {
      time: 1706814000,
      players: [
        { _id: player1.insertedId, playerName: "Jason Qiu" },
        { _id: player2.insertedId, playerName: "Patrick Hill" },
        { _id: player3.insertedId, playerName: "Jackey Yang" },
        { _id: player4.insertedId, playerName: "Eddison So" },
        { _id: player5.insertedId, playerName: "Bryan Chan" },
        { _id: player6.insertedId, playerName: "Britney Yang" },
        { _id: player7.insertedId, playerName: "Jing Ngo" },
        { _id: player8.insertedId, playerName: "Aidan Haberman" },
        { _id: player9.insertedId, playerName: "John Doe" },
      ],
      max: 20,
    },
  ],
});
console.log("Seeding successful!");
await closeConnection();