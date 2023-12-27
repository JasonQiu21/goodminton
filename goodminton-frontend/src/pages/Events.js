import React from 'react'
import axios from 'axios';

import { Link, Navigate } from 'react-router-dom'

export default class Events extends React.Component {
    state = {
        events: []
    }

    componentDidMount() {
        axios.get(`http://${process.env.REACT_APP_BACKENDAPI}/events`)
            .then(response => {
                const events = response.data
                this.setState({ events })
            }).catch(error => {
                return <Navigate to={{
                    pathname: "/error",
                    state: { referrer: "/events", error: error.response.data.error }
                }} />
            })
    }

    render() {
        return (
            <section id="events">
                <h1>Events</h1>
                <div className="allEvents" id="allEvents">
                    {this.state.events.map((event, i) => {
                        console.log(event)
                        return <Link key={i} to={`/events/${event._id.toString()}`}>{event.name}</Link>
                    })}
                </div>
            </section>
        )
    }
}
