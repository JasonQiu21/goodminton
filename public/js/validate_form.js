import * as typecheck from "../../typecheck.js";
let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    console.log("login");
    e.preventDefault();
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    // email = typecheck.checkEmail(email, "Email");
    // password = typecheck.isValidString(password, "Password");
    let body = {
      email,
      password,
    };
    try {
      let response = await fetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (response.status === 200) {
        window.location.href = "/";
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (e) {
      console.log(e);
      document.getElementById("error").innerHTML = e.error;
    }
    registerForm.submit();
  });
}
