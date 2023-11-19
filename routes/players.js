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
}*/