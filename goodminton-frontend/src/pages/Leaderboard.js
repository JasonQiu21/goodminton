import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Leaderboard = ({ auth }) => {
    const [players, setPlayers] = useState(null);
    const [sort, setSort] = useState("singlesRating");


    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKENDAPI}/leaderboard`, {
            withCredentials: true,
        }).then((response) => {
            const players = response.data;
            setPlayers(players);
        })
    }, [null])

    if (players) {
        players.sort((a, b) => {
            return b[sort] - a[sort];
        });

        return (
            <section>
                <div className="leaderboardPage">
                    <h1>Leaderboard</h1>
                    <div className="leaderboardTableDiv">
                        <table className="leaderboardTable">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Name</th>
                                    <th><button type="button" onClick={(() => setSort("singlesRating"))}>Singles Rating</button></th>
                                    <th><button type="button" onClick={(() => setSort("doublesRating"))}>Doubles Rating</button></th>
                                </tr>
                            </thead>
                            <tbody>
                                {players.map((player, i) => {
                                    return (
                                        <tr key={i}>
                                            <td>{i + 1}</td>
                                            <td><Link to={`/players/${player._id}`}>{player.playerName}</Link></td>
                                            <td>{player.singlesRating}</td>
                                            <td>{player.doublesRating}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        )
    }


}

export default Leaderboard;