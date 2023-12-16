$("#playerNameChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
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
    },
  });
});

$("#emailChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
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
    },
  });
});

$("#passwordChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
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
    },
  });
});

$("#phoneChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const id = window.location.pathname.split('/').at(-1);
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
    },
  });
});