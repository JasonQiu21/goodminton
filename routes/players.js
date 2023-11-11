import { Router } from 'express';
const router = Router();

/*
Schema for Player:

{
    "id": new ObjectId(),
    "name": string,
    "picture" string (filepath),
    "email": string (can be null),
    "phone": string (can be null),
    "rating1": float -- singles rating,
    "rating2": float -- doubles rating,
}

TODO:
    - [GET /] - Get all users from database (in JSON format?)

    - [GET /:id] - Get user ID from database, render a layout with handlebars (also fetch match history!!)
    - [POST /:id] - Create user ID in database

    - [GET /:id/edit] - Render a layout with handlebars (edit user page)
    - [PUT /:id/edit] - Update user ID in database
*/