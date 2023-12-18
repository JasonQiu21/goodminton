let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let error = document.getElementById("error");
let profileForm = document.getElementById("profileForm");

let scoreSubmissionForm = document.getElementById("scoreSubmissionForm");
let generateBracketForm = document.getElementById("generateBracketForm");
let generateSwissRoundForm = document.getElementById("generateSwissRoundForm");
let generateTopCutForm = document.getElementById("generateTopCutForm");

const isValidString = (input, name = "String input", allow_empty = false) => {
  if (!input) throw { status: 400, error: `${name} must be provided.` };
  if (typeof input !== "string")
    throw { status: 400, error: `${name} is not a string.` };
  if (!allow_empty && input.trim().length === 0)
    throw { status: 400, error: `${name} is blank.` };

  return input.trim();
};

const isValidNumber = (num, name = "Number input") => {
  if (typeof num !== "number")
    throw { status: 400, error: `${name} is not a number.` };
  if (!(!!num || num === 0))
    throw { status: 400, error: `${name} is not a valid number.` };

  return num;
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

if (scoreSubmissionForm) {
  scoreSubmissionForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("scoreSubmission");
    let matchId, team1score, team2score, winner;
    let errorList = [];

    try {
      matchId = isValidString(document.getElementById("id").value, "Match ID");
    } catch (e) {
      errorList.push("Match ID was formatted incorrectly.");
    }

    try {
      team1score = isValidNumber(parseInt(document.getElementById("team1score").value), "Team 1 Score");
    } catch (e) {
      errorList.push("Team 1 Score was formatted incorrectly.");
    }
    try {
      team2score = isValidNumber(parseInt(document.getElementById("team2score").value), "Team 2 Score");
    } catch (e) {
      errorList.push("Team 2 Score was formatted incorrectly.");
    }

    try {
      winner = isValidNumber(parseInt(document.getElementById("winner").value), "Winner");
    } catch (e) {
      errorList.push("Winner was formatted incorrectly.");
    }

    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      scoreSubmissionForm.scores = [team1score, team2score];
      scoreSubmissionForm.submit();
    }
  });
}

if (generateBracketForm) {
  generateBracketForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("generateBracket");
    let errorList = [];
    let id
    try {
      id = isValidString(document.getElementById("id2").value, "Event ID");
    } catch (e) {
      errorList.push("Event ID was formatted incorrectly.");
    }
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      generateBracketForm.id = id;
      generateBracketForm.submit();
    }
  });
}

if (generateSwissRoundForm) {
  generateSwissRoundForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("generateSwissRound");
    let errorList = [];
    let id
    try {
      id = isValidString(document.getElementById("id3").value, "Event ID");
    } catch (e) {
      errorList.push("Event ID was formatted incorrectly.");
    }
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      generateSwissRoundForm.id = id;
      generateSwissRoundForm.submit();
    }
  });
}

if (generateTopCutForm) {
  generateTopCutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("generateTopCut");
    let errorList = [];
    let id
    try {
      id = isValidString(document.getElementById("id4").value, "Event ID");
    } catch (e) {
      errorList.push("Event ID was formatted incorrectly.");
    }
    if (errorList.length > 0) {
      error.innerHTML = errorList.join("<br>");
      return;
    } else {
      generateTopCutForm.id = id;
      generateTopCutForm.submit();
    }
  });
}