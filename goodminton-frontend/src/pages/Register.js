import { Link } from 'react-router-dom';
import { isValidString } from './client_typecheck.js'

import Error from './Error.js'
import axios from 'axios';

const Register = ({ auth }) => {
    if (auth) {
        const err = {
            referrer: `/login`, error: "You can't register; you're already logged in!"
        };
        return <Error error={err} />
    }

    const handleRegistration = (event) => {
        let errorList = [];
        let error = document.getElementById("error");
        event.preventDefault();

        let tags = ["playerName", "email", "password", "confirmPassword"]

        try {
            for (let tag of tags) {
                console.log(tag)
                isValidString(document.getElementById(tag).value, tag);
            }
        } catch (e) {
            errorList.push(e.message);
        }

        if (document.getElementById("password").value !== document.getElementById("confirmPassword").value) errorList.push("Passwords do not match.");

        if (errorList.length > 0) {
            error.hidden = false;
            error.innerHTML = errorList.join("<br>")
        } else {
            error.hidden = true;

            let newPlayer = {};
            for (let tag of tags) newPlayer[tag] = document.getElementById(tag).value;
            if (document.getElementById("phoneNumber").value) newPlayer.phoneNumber = document.getElementById("phoneNumber").value;
            else newPlayer.phoneNumber = "";

            let axiospost = (callback) => {
                axios.post(`${process.env.REACT_APP_BACKENDAPI}/register`,
                    newPlayer,
                    { withCredentials: true }).then(response => {
                        callback(true, "")
                    }).catch(error => {
                        callback(false, error.response.data.error);
                    })
            };

            axiospost((success, data) => {
                if (!success) {
                    error.hidden = false;
                    error.innerHTML = data;
                } else window.location.href = "/login"
            })
        }
    }

    return (
        <section>
            <div className="registerPage">
                <form onSubmit={handleRegistration} className="registerForm" id="registerForm">
                    <h3>Register</h3>
                    <label>Player Name</label>
                    <input type="text" id="playerName" name="playerName" placeholder="" />
                    <label>Email</label>
                    <input type="text" id="email" name="email" placeholder="" />
                    <label>Password</label>
                    <input type="password" id="password" name="password" placeholder="********" />
                    <label>Confirm Password</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="********" />
                    <label>Phone Number</label>
                    <input type="text" id="phoneNumber" name="phoneNumber" placeholder="" />
                    <button className="registerButton" type="submit">Register</button>
                    <p id="error" hidden>error</p>
                    <p>Already have an account? <Link to="/login">Login</Link></p>
                </form>
            </div>
        </section>
    )
}

export default Register;