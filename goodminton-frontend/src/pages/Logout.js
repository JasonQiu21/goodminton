import Error from './Error.js';

const Logout = ({ auth, onLogout }) => {
    let success = false;

    if (!auth) {
        const err = {
            referrer: `/logout`, error: "You can't logout; you were never logged in!"
        };
        return <Error error={err} />
    } else {
        const logout = (callback) => {
            onLogout();
            callback();
        }

        logout(() => {
            console.log("You logged out...");
            success = true;
            window.location.href = '/'
        })
    }

}

export default Logout;