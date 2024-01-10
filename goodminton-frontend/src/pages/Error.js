import React from 'react'

const Error = ({ error }) => {
    return (
        <section className="error">
            <div className="parentDiv">
                <div className="homeInfo">
                    <h1>Error TvT</h1>
                    <p className="error">{error.error}</p>
                </div>
            </div>

            <div className="pictureInfo">
                <img src="/cat.jpg" alt="cat" />
            </div>
        </section>
    )
}

export default Error


