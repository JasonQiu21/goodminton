import { Outlet, Link } from "react-router-dom";

const Layout = ({ auth }) => {
    return (
        <>
            <header>
                <nav>
                    <ul className="navbar">
                        <li className="navlogo"><Link to="/">Goodminton</Link></li>
                        {auth && <li class="navitem"><a href={"/players/" + auth.playerId}>Profile</a></li>}
                        <li className="navitem"><a href="/events">Events</a></li>
                        {auth && <li className="navitem"><a href="/players/reservations/{{id}}">Reservations</a></li>}
                        <li className="navitem"><a href="/leaderboard">Leaderboard</a></li>
                        {auth && auth.player.role === "admin" && <li className="navitem"><a href="/createEvent">Create Event</a></li>}
                        {auth && <li className="navitem"><a href="/logout">Sign Out</a></li>}
                        {auth === null && <li className="navitem"><a href="/login">Sign In</a></li>}

                    </ul>
                </nav>

                <Outlet />
            </header>
        </>
    )
};

export default Layout;