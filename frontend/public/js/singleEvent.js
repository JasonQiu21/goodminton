$(".join-button").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const eventId = window.location.pathname.split('/').at(-1);
  var timeStamp = $(this).data("id")
  console.log(timeStamp);

  $.ajax({
    url: `/api/events/reserve/${eventId}`,
    type: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      time: timeStamp,
    }),
    success: function (result) {
      $("#error").hide();
      location.reload(true);
      //   $("#playerName").attr("placeholder", result.playerName);
      //   $("#playerName").val("");
      //   success("Player name updated!");
    },
    error: function (result) {
      $("#error").removeAttr("hidden");
      $("#error").text(result.responseJSON.error);
    }
  });

});

$(".leave-button").click(function (e) {
  console.log("button pressed");
  e.preventDefault();
  const eventId = window.location.pathname.split('/').at(-1);
  // var timeStamp = $(this).data("id")
  // console.log(timeStamp);
  try {
    $.ajax({
      url: `/api/events/reserve/${eventId}`,
      type: "DELETE",
      contentType: "application/json",
      dataType: "json",
      data: JSON.stringify({
      }),
      success: function (result) {
        $("#error").hide();
        console.log(result);
        location.reload(true);
        //   $("#playerName").attr("placeholder", result.playerName);
        //   $("#playerName").val("");
        //   success("Player name updated!");
      },
      error: function (result) {
        $("#error").removeAttr("hidden");
        $("#error").text(result.responseJSON.error);
      }
    });
  } catch (e) {
    console.log(e);
  }
});
