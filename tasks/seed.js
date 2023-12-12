import { dbConnection, closeConnection } from '../config/mongoConnection.js';

import { events, players } from "../config/mongoCollections.js";
import { ObjectId } from 'mongodb';

const db = await dbConnection();
await db.dropDatabase();

const eventsCol = await events();
const playersCol = await players();

//NOTE: For BCrypt Hash, cost factor/salt rounds is set to 10.

const player1 = await playersCol.insertOne({
    password: "$2y$10$u7PotR0ZFKhLBMu2M8p9Ne9wVQiu1OPk6NoQybbWXxU.ilX8JqVQK", //password1
    playerName: "Jason Qiu",
    email: "jqiu21@stevens.edu",
    phone: null,
    role: "admin",
    singlesRating: 469,
    doublesRating: 902,
});

const player2 = await playersCol.insertOne({
    password: "$2y$10$C5jhZtGVF3eN4feeZYn5V.3UTCnbtL9YpROQLsqqHeW2r2rrrTzb.", //password12
    playerName: "Patrick Hill",
    email: "phill@stevens.edu",
    phone: "8484682000",
    role: "user",
    singlesRating: 800,
    doublesRating: 800
});

const player3 = await playersCol.insertOne({
    password: "$2y$10$mqn.wu3E7DwCdr.wdsXuQezjq/6iE4qLzzzqVY3iIfy.q.bl1nNIu", //password123
    playerName: "Jackey Yang",
    email: "jyang28@stevens.edu",
    phone: null,
    role: "admin",
    singlesRating: 500,
    doublesRating: 500
});

const player4 = await playersCol.insertOne({
    password: "$2y$10$.3z6jVXFV/z8JRat1ZCjYOSnHzY8cVaNg9mJ1b9Z0UxWYNpLxqMvC", //password1234
    playerName: "Eddison So",
    email: "eso69@stevens.edu",
    phone: "7322518976",
    role: "admin",
    singlesRating: 1200,
    doublesRating: 1200
});

const player5 = await playersCol.insertOne({
    password: "$2y$10$H4vtw4Yt6m94GouZlY.j.eK/R7O0rTysYlk7rhN2JFu5amw/q3ttK", //password12345
    playerName: "Bryan Chan",
    email: "bchan4@stevens.edu",
    phone: "8484688222",
    role: "user",
    singlesRating: 800,
    doublesRating: 800
});

const player6 = await playersCol.insertOne({
    password: "$2y$10$gRNAfkP0UAKjo/l5xaoP4urr1JxOtMdRXFjqvBAoD8foRitx0DnfK", //password6
    playerName: "Britney Yang",
    email: "byang69@stevens.edu",
    phone: null,
    role: "admin",
    singlesRating: 200,
    doublesRating: 200
});

const player7 = await playersCol.insertOne({
    password: "$2y$10$feOQEQTk0UvQFEwmYtYQjeiea8WTyw/Ti4AWAZMvydfQ1o4537Fyq", //password67
    playerName: "Jing Ngo",
    email: "jngo@stevens.edu",
    phone: "1111111111",
    role: "user",
    singlesRating: 230,
    doublesRating: 500
});

const player8 = await playersCol.insertOne({
    password: "$2y$10$G3rgcBM.iMH2fcYmo6mHlOSfy7Ti9CGtPT8csOoA76YWA3frpCqqe", //password67890
    playerName: "Aidan Haberman",
    email: "ahaberm@stevens.edu",
    role: "user",
    phone: null,
    singlesRating: 1300,
    doublesRating: 1000
});

const event1 = await eventsCol.insertOne({
    name: "11/28/2023 Practice",
    date: "1701205200", //November 24th, 2023 at 4PM
    eventType: "practice",
    matches: null,
    reservations: [
        {
            time: "1700859600",
            players: [
                { _id: player1.insertedId, name: "Jason Qiu" },
                { _id: player2.insertedId, name: "Patrick Hill" },
                { _id: player3.insertedId, name: "Jackey Yang" },
                { _id: player4.insertedId, name: "Eddison So" },
            ],
            max: 12
        },
        {
            time: "1701207000",
            players: [
                { _id: player6.insertedId, name: "Britney Yang" },
            ],
            max: 12
        },
        {
            time: "1701208800",
            players: [
                { _id: player8.insertedId, name: "Aidan Haberman" },
            ],
            max: 4
        },
        {
            time: "1701210600",
            players: [],
            max: 4
        }
    ]
})

const event2 = await eventsCol.insertOne({
    name: "12/08/2023 Practice",
    date: "1702062000", //December 8th, 2023 at 2PM
    eventType: "tournament",
    matches: {},
    reservations: [
        {
            time: "1702062000",
            players: [
                { _id: player1.insertedId, name: "Jason Qiu" },
                { _id: player2.insertedId, name: "Patrick Hill" },
                { _id: player3.insertedId, name: "Jackey Yang" },
                { _id: player4.insertedId, name: "Eddison So" },
                { _id: player5.insertedId, name: "Bryan Chan" },
            ],
            max: 20
        }
    ]
})

const event3 = await eventsCol.insertOne({
    name: "11/28/2023 League Night",
    date: "1701208800", //November 28th, 2023 at 6PM
    eventType: "leaguenight",
    matches: {},
    reservations: [
        {
            time: "1701208800",
            players: [
                { _id: new ObjectId(player1.insertedId), name: "Jason Qiu" },
                { _id: new ObjectId(player4.insertedId), name: "Eddison So" }
            ],
            max: 5
        }
    ]
});

console.log("Seeding successful!");
await closeConnection();