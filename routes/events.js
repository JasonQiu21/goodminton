import { Router } from 'express';
const router = Router();

/*
Schema for Event:

{
    "id": new ObjectId(),
    "name": string,
    "date": string (MM/DD/YYYY),
    "eventType": string (tournament, league night, practice, etc.),
    "teamType": string (singles, doubles),
    "matches": {},
    "players": [
        {
            "id": "1",
            "name": "John Doe",
        },
        ...
    ]
}

Example of Tournament Generation:
{
    "id": new ObjectId(),
    "name": "2024 January Singles Tournament",
    "date": "01/05/2024",
    "eventType": "tournament",
    "teamType": "doubles",
    "matches": {
        "1": [
            {
                "id": new ObjectId(),
                "team1": [{"id": "1", "name": "Bryan Chan"}, {"id": "2", "name": "Britney Yang"}],
                "team2": [{"id": "3", "name": "Jackey Yang"}, {"id": "4", "name": "Jason Qiu"}],
                "team1Score": 0,
                "team2Score": 0,
                "winner": null
            },
            {
                "id": new ObjectId(),
                "team1": [{"id": "5", "name": "Patrick Hill"}, {"id": "6", "name": "Yihan Jiang"}],
                "team2": [{"id": "7", "name": "Aidan Haberman"}, {"id": "8", "name": "Madhava Rakshit"}],
                "team1Score": 0,
                "team2Score": 0,
                "winner": null
            }
        ],
        "2": [
            {
                
                "id": new ObjectId(),
                "team1": [],
                "team2": [],
                "team1Score": 0,
                "team2Score": 0,
                "winner": null
            
            }
        ]
    },
    "players": [
        {
            "id": "1",
            "name": "Bryan Chan",
        },
        {
            "id": "2",
            "name": "Britney Yang",
        },
        {
            "id": "3",
            "name": "Jackey Yang",
        },
        {
            "id": "4",
            "name": "Jason Qiu",
        },
        {
            "id": "5",
            "name": "Patrick Hill",
        },
        {
            "id": "6",
            "name": "Yihan Jiang",
        },
        {
            "id": "7",
            "name": "Aidan Haberman",
        },
        {
            "id": "8",
            "name": "Madhava Rakshit",
        },
    ]
}

TODO:
    - [GET /] - Get all events from database, render a layout with handlebars

    - [GET /:id] - Get event from database, render a layout with handlebars 
    - [PUT /:id] - Update event in database

    - [GET /create] - Render a layout with handlebars (create event page)
    - [POST /create] - Create event in database

    - [GET /:id/edit] - Render a layout with handlebars (edit event page)
    - [POST /:id/edit] - Update event in database

    - [GET /:id/delete] - Render a layout with handlebars (delete event page)
    - [DELETE /:id/delete] - Delete event in database

    - [GET /:id/start] - Render a layout with handlebars (start event confirmation page)
    - [POST /:id/start] - Start event in database (match generation, etc.)
*/