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
  str = str.toLowerCase();
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
    let errorList = [];
    e.preventDefault();
    try {
      checkEmail(document.getElementById("email").value);
    } catch (e) {
      errorList.push("Email was formatted incorrectly");
    }
    try {
      isValidString(document.getElementById("password").value, "Password");
    } catch (e) {
      errorList.push("Password was formatted incorrectly");
    }
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    }
    loginForm.submit();
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    console.log("register");
    let errorList = [];
    e.preventDefault();
    try {
      isValidString(document.getElementById("playerName").value, "Player Name");
    } catch (e) {
      errorList.push(e.error);
    }
    try {
      checkEmail(document.getElementById("email").value, "Email");
    } catch (e) {
      errorList.push(e.error);
    }
    let password = "";
    let confirmPassword = "";
    try {
      password = isValidString(
        document.getElementById("password").value,
        "Password"
      );
    } catch (e) {
      errorList.push(e.error);
    }
    try {
      confirmPassword = isValidString(
        document.getElementById("confirmPassword").value,
        "Confirm Password"
      );
    } catch (e) {
      errorList.push(e.error);
    }
    if (password !== confirmPassword) errorList.push("Passwords don't match");
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      registerForm.submit();
    }
  });
}
