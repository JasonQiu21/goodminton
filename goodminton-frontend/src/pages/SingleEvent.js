import React, { useState, useEffect } from 'react'
import axios from 'axios';

import { useParams } from 'react-router-dom'

import Error from './Error.js'

const SingleEvent = ({ auth }) => {
    const { id } = useParams()
    const [error, setError] = useState("");
    const [event, setEvent] = useState(null)


    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BACKENDAPI}/events/${id}`)
            .then(response => {
                const event = response.data;
                setEvent(event);
            }).catch(error => {
                setError(error.response.data);
            })
    }, [id])

    if (error) {
        const err = {
            referrer: `/events/${id}`, error: error.error
        };
        return <Error error={err} />
    }

    if (event) {
        let loggedIn = auth ? true : false;

        if (event.eventType === "practice") {
            return (
                <section>
                    <h1>Practice</h1>
                    <h3>{event.eventName}</h3>
                    <p>Date: {new Date(event.date * 1000).toDateString()}</p>
                    <p>Time: {new Date(event.date * 1000).toTimeString()}</p>
                    <div className="grid-container">
                        {event.reservations.map((reservation, i) => {
                            return (<div key={i}>
                                <h3>{new Date(reservation.time * 1000).toDateString()}</h3>
                                <h4>{new Date(reservation.time * 1000).toTimeString()}</h4>
                                <p>Capacity: {reservation.players.length}/{reservation.max}</p>
                                {reservation.players.length >= reservation.max ?
                                    <p>Full</p> :
                                    (loggedIn && (
                                        reservation.players.some(player => player._id.toString() === auth.playerId) ?
                                            <button className="leave-button" data-id={new Date(reservation.time * 1000).toTimeString()}>Leave</button>
                                            :
                                            <button className="join-button" data-id={new Date(reservation.time * 1000).toTimeString()}>Join</button>
                                    ))
                                }
                                <div className="nested-grid-container">
                                    {reservation.players.map((player, i) => {
                                        return (
                                            <div key={`player-${i}`}>
                                                <p>{player.playerName}</p>
                                            </div>
                                        )
                                    })}
                                </div>


                            </div>)
                        })}
                    </div>
                </section>

            )
        }
    } else {
        return <p>Loading...</p>
    }
}


export default SingleEvent;