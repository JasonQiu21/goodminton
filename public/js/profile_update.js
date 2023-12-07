$("#usernameChangeButton").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  $.ajax({
    url: "/api/players/",
    type: "PATCH",
    data: {
      playerName: $("#username").val(),
    },
    success: function (result) {
      console.log(result);
      $("#username").val(result.playerName);
    },
  });
});
