import React from 'react'
import axios from 'axios';

import { checkEmail, isValidString } from './client_typecheck.js'

import Error from './Error.js'

const Login = ({ auth, onLogin }) => {

    //if player is already authenticated, redirect
    if (auth) {
        const err = {
            referrer: `/login`, error: "You can't login; you're already logged in!"
        };
        return <Error error={err} />
    }

    const handleSubmit = (event) => {
        let email, password;
        let errorList = [];
        event.preventDefault();

        let error = document.getElementById("error");

        try {
            email = checkEmail(document.getElementById("email").value);
        } catch (e) {
            errorList.push("Email was formatted incorrectly");
        }
        try {
            password = isValidString(document.getElementById("password").value, "Password");
        } catch (e) {
            errorList.push("Password was formatted incorrectly");
        }
        if (errorList.length > 0) {
            error.hidden = false;
            error.innerHTML = errorList.join("<br>");
            return;
        } else {
            error.hidden = true;

            //now we try to login
            let axiospost = (callback) => {
                axios.post(`${process.env.REACT_APP_BACKENDAPI}/login`, {
                    email: email,
                    password: password
                }).then(response => {
                    console.log(response)
                    onLogin(response.data)
                    console.log(response.data);
                    callback(true, response.data);
                }).catch(error => {
                    console.log(error);
                    callback(false, error.response.data.error);
                })
            }

            axiospost((success, data) => {
                if (!success) {
                    error.hidden = false;
                    error.innerHTML = data;
                } else window.location.href = `/`
            })

        }
    }

    return (
        <section>
            <div className="loginPage">
                <form onSubmit={handleSubmit} className="loginForm" id="loginForm">
                    <h3>Login</h3>
                    <label>Email</label>
                    <input type="text" id="email" name="email" placeholder="" />
                    <label>Password</label>
                    <input type="password" id="password" name="password" placeholder="********" />
                    <button className="loginButton" type="submit">Login</button>
                    <p id="error"></p>
                    <p>Don't have an account? <a href="/register">Register</a></p>
                </form>
                <p id="error" hidden>This is an error.</p>
            </div>
        </section>
    )
}

export default Login;