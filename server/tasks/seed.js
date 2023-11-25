import {dbConnection, closeConnection} from '../config/mongoConnection.js';
import {createEvent} from '../data/events.js'; //TODO in ../data/events.js
import {createPlayer} from '../data/attendees.js'; //TODO in ../data/players.js

const db = await dbConnection();
await db.dropDatabase();

const event1 = await createEvent(
    
);


const event2 = await create(
    "Event 2",
    "Jackey Yang is a HUGE fan of anime.",
    {"streetAddress": "2 Washington Street", "city": "Albany", "state": "NY", "zip": "00000"},
    "thisisthecia@notthecia.gov",
    60000,
    2,
    "10/02/2024",
    "11:00 AM",
    "6:00 PM",
    false
);

const event3 = await create(
    "Event 3",
    "Lorem ipsum idk what the rest is but im just gonna keep typing here to hit the 25 character minimum.",
    {"streetAddress": "178 Ben Dover Lane", "city": "Atlanta", "state": "GA", "zip": "69420"},
    "notpatrickhill@gmail.com",
    1,
    100.22,
    "11/05/2023",
    "6:00 PM",
    "6:48 PM",
    false
);

const attendee1 = await createAttendee(
    event1._id.toString(),
    "Bryan",
    "Chan",
    "bchan4@stevens.edu"
)

console.log("Seeding successful!");
await closeConnection();