import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import Error from "./Error.js"


const Reservations = ({ auth }) => {
    const [reservations, setReservations] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_BACKENDAPI}/players/reservations/${auth._id}`, {
                withCredentials: true,
            })
            .then((response) => {
                const reservations = response.data;
                setReservations(reservations);
            })
            .catch((error) => {
                setError(error.response.data);
            });
    }, []);

    if (error) {
        const err = {
            referrer: `/reservations`,
            error: error.error,
        };
        return <Error error={err} />;
    }

    if (reservations) {
        console.log(reservations);
        if (reservations.length === 0) return (<p>No Reservations!</p>)
        return (
            <section>
                <div className="grid-container">
                    {reservations.map((reservation, i) => {
                        return (
                            <div key={i}>
                                <h3>{reservation.name}</h3>
                                <p>{new Date(reservation.time * 1000).toDateString()}</p>
                                <Link to={`/events/${reservation._id}`}>More Info</Link>
                            </div>
                        )
                    })}
                </div>
            </section>
        )
    }
}

export default Reservations;