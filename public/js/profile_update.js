$("#playerNameChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
  try {
    isValidString($("#playerName").val());
    $.ajax({
      url: `/api/players/${id}`,
      type: "PATCH",
      data: {
        playerName: $("#playerName").val(),
      },
      success: function (result) {
        console.log(result);
        $("#playerName").attr("placeholder", result.playerName);
        $("#playerName").val("");
        success("Player name updated!");
      },
    });
  } catch (e) {
    error(e.error);
  }
});

$("#emailChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
  try {
    checkEmail($("#email").val());
    $.ajax({
      url: `/api/players/${id}`,
      type: "PATCH",
      data: {
        email: $("#email").val(),
      },
      success: function (result) {
        console.log(result);
        $("#email").attr("placeholder", result.email);
        $("#email").val("");
        success("Email updated!");
      },
    });
  } catch (e) {
    error(e.error);
  }
});

$("#passwordChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
  try {
    isValidString($("#password").val());
    isValidString($("#confirmPassword").val());
    if ($("#password").val() !== $("#confirmPassword").val())
      throw { status: 400, error: "Passwords do not match" };

      $.ajax({
        url: `/api/players/${id}`,
        type: "PATCH",
        data: {
          password: $("#password").val(),
        },
        success: function (result) {
          console.log(result);
          $("#password").attr("placeholder", "********");
          $("#confirmPassword").attr("placeholder", "********");
          $("#password").val("");
          $("#confirmPassword").val("");
          success("Password updated!");
        },
      });
  } catch (e) {
    error(e.error);
  }
});

$("#phoneChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
  try {
    isValidPhone($("#phone").val());
    $.ajax({
      url: `/api/players/${id}`,
      type: "PATCH",
      data: {
        phone: $("#phone").val(),
      },
      success: function (result) {
        console.log(result);
        $("#phone").attr("placeholder", result.phone);
        $("#phone").val("");
        success("Phone number updated!");
      },
    });
  } catch (e) {
    error(e.error);
  }
});

function error(message) {
  $("#error").text(message);
  $("#success").text("");
}

function success(message) {
  $("#success").text(message);
  $("#error").text("");
}

const isValidString = (
  input,
  name = "String input",
  allow_empty = false
) => {
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

const isValidPhone = (phone) => {
  phone = isValidString(phone, "Phone Number");
  if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im.test(phone))
    throw { status: 400, error: "Bad phone number" };
  return phone;
};