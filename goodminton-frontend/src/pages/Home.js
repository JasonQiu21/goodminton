import React from 'react'

const Home = ({ auth }) => {
    return (
        <section>
            <div className="parentDiv">
                <div className="homeInfo">
                    <h1>Welcome to Goodminton</h1>
                    <p>Welcome to Goodminton your go-to destination for hassle-free badminton experiences! Easily book courts at top venues, participate in thrilling tournaments, and connect with a vibrant badminton community. Enjoy the convenience of anytime, anywhere access to elevate your game. Goodminton where convenience meets competition for the ultimate badminton bliss!</p>
                    {auth ?
                        <React.Fragment>
                            <p>Check to see what events there are</p>
                            <a className="homeButton" href="/events"> Events</a>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <p>Sign up today to start playing!</p>
                            <a className="homeButton" href="/register">Sign Up</a>
                        </React.Fragment>
                    }

                </div>
                <div className="pictureInfo">
                    <img src="chicken.jpg" alt="chicken" />
                </div>
            </div>
        </section>
    )
}

export default Home;