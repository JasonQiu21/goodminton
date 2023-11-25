import * as typecheck from "./typecheck.js";
import {events} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

eventTypes = ["tournament", "leaguenight", "practice"];

const createEvent = async(eventName, eventDescription, eventDate, eventType) => {
    //input validation
    eventName = typecheck.isValidString(eventName, "Event Name");
    eventDescription = typecheck.isValidString(eventDescription, "Event Description", true);
    eventDate = typecheck.isValidDate(eventDate, "Event Date");

    eventType = typecheck.isValidString(eventType, "Event Type").toLowerCase();
    if(!eventTypes.includes(eventType)) throw {'status': 400, 'error': 'Invalid event type.'};

    if(eventType === 'practice') { //in this case, reservations need to be made

    } else {

    }
}