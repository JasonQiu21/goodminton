import _ from "lodash";
import moment from "moment";
import { ObjectId } from "mongodb";

let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let error = document.getElementById("error");
let profileForm = document.getElementById("profileForm");

const isValidString = (input, name = "String input", allow_empty = false) => {
  if (!input) throw { status: 400, error: `${name} must be provided.` };
  if (typeof input !== "string")
    throw { status: 400, error: `${name} is not a string.` };
  if (!allow_empty && input.trim().length === 0)
    throw { status: 400, error: `${name} is blank.` };

  return input.trim();
};
const checkEmail = (str) => {
  str = isValidString(str);
  str = _.toLower(str);
  let [prefix, domain] = str.split("@");

  const prefixRegex = /^[a-zA-Z0-9_.-]+$/;
  const prefixRegex2 = /^[_.-]+$/;
  const domainRegex = /^[a-zA-Z0-9-]+$/;

  if (!prefixRegex.test(prefix))
    throw { status: 400, error: "Email prefix bad" };
  if (prefixRegex2.test(prefix.charAt(prefix.length - 1)))
    throw { status: 400, error: "Email prefix bad" };

  if (!domain) throw { status: 400, error: "bad email" };
  let end;
  [domain, end] = domain.split(".");
  if (!end) throw { status: 400, error: "bad email" };
  if (!domainRegex.test(domain))
    throw { status: 400, error: "Bad email domain" };

  if (!/^[a-zA-Z]+$/.test(end) || end.length < 2)
    throw { status: 400, error: "Bad email domain" };
  return str;
};

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    console.log("login");
    e.preventDefault();
    try {
      let email = checkEmail(document.getElementById("email").value);
      let password = isValidString(
        document.getElementById("password").value,
        "Password"
      );
    } catch (e) {
      console.log(e);
      error.innerHTML = e.error;
      return;
    }
    registerForm.submit();
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    console.log("register");
    e.preventDefault();
    try {
      let username = isValidString(
        document.getElementById("username").value,
        "Username"
      );
      let realName = isValidString(
        document.getElementById("realName").value,
        "Real Name"
      );
      let email = checkEmail(document.getElementById("email").value);
      let password = isValidString(
        document.getElementById("password").value,
        "Password"
      );
      let confirmPassword = isValidString(
        document.getElementById("confirmPassword").value,
        "Confirm Password"
      );
      if (password !== confirmPassword)
        throw { status: 400, error: "Passwords do not match" };
      let phoneNumber = isValidString(
        document.getElementById("phoneNumber").value,
        "Phone Number"
      );
    } catch (e) {
      console.log(e);
      error.innerHTML = e.error;
      return;
    }
  });
}

if (profileForm) {
  profileForm.addEventListener("submit", async (e) => {
    console.log("profile");
    let errorList = [];
    e.preventDefault();
    let username = document.getElementById("username")?.value;
    if (username == "") {
      username = document
        .getElementById("username")
        .getAttribute("placeholder");
    }
    try {
      username = isValidString(username);
    } catch (e) {
      errorList.push(e.error);
    }
    let email = document.getElementById("email")?.value;
    if (email == "") {
      email = document.getElementById("email").getAttribute("placeholder");
    }
    try {
      email = checkEmail(email);
    } catch (e) {
      errorList.push(e.error);
    }
    let password = document.getElementById("password")?.value;
    if (password == "") {
      password = document
        .getElementById("password")
        .getAttribute("placeholder");
    }
    try {
      password = isValidString(password);
    } catch (e) {
      errorList.push(e.error);
    }
    let confirmPassword = document.getElementById("confirmPassword")?.value;
    if (confirmPassword == "") {
      confirmPassword = document
        .getElementById("confirmPassword")
        .getAttribute("placeholder");
    }
    try {
      confirmPassword = isValidString(confirmPassword);
    } catch (e) {
      errorList.push(e.error);
    }
    if (password !== confirmPassword) errorList.push("Passwords do not match");
    let phoneNumber = document.getElementById("phoneNumber")?.value;
    if (phoneNumber == "") {
      phoneNumber = document
        .getElementById("phoneNumber")
        .getAttribute("placeholder");
    }
    try {
      phoneNumber = isValidString(phoneNumber);
    } catch (e) {
      errorList.push(e.error);
    }
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      let requestConfig = {
        method: "PATCH",
        url: "/api/",
        body: {
          username: username,
          email: email,
          password: password,
          phoneNumber: phoneNumber,
          singlesRating: document.getElementById("singlesRatingText"),
          doublesRating: document.getElementById("doublesRatingText"),
        },
      };
    }
    profileForm.submit();
  });
}
