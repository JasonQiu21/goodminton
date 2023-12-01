import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  res.render("home", { title: "Goodminton Home Page" });
});

router.get("/profile", async (req, res) => {
  res.render("profile", { title: "Profile" });
});

export default router;

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
*/
