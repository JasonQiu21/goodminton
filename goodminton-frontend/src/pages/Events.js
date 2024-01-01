import React from 'react'
import axios from 'axios';

import { Link, Navigate } from 'react-router-dom'

export default class Events extends React.Component {
    state = {
        events: []
    }


    constructor(props) {
        super(props)
        axios.get(`http://${process.env.REACT_APP_BACKENDAPI}/events`, { withCredentials: true })
            .then(response => {
                const events = response.data
                this.setState({ events })
            }).catch(error => {
                return <Navigate to={{
                    pathname: "/error",
                    state: { referrer: "/events", error: error.request.response.error }
                }} />
            })
    }

    render() {
        return (
            <section id="events">
                <h1>Events</h1>
                <div className="allEvents" id="allEvents">
                    {this.state.events.map((event, i) => {
                        return <Link key={i} to={`/events/${event._id.toString()}`}>{event.name}</Link>
                    })}
                </div>
            </section>
        )
    }
}
