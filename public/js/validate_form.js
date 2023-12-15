import _ from "lodash";
import moment from "moment";
import { ObjectId } from "mongodb";

let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let error = document.getElementById("error");

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
