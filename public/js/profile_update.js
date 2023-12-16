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
      $("#playerName").val(result.playerName);
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
      $("#email").val(result.email);
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
      const astrisks = "*".repeat(result.password.length);
      $("#password").val(astrisks);
      $("#confirmPassword").val(astrisks);
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
      $("#phone").val(result.phone);
    },
  });
});