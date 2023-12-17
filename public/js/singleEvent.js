$("#join-button").click(function (e) {
    console.log("button pressed");
    //e.preventDefault();
    const eventId = window.location.pathname.split('/').at(-1);
    const timeStamp = $("#join-button").attr("data-id")
    try {
      isValidString($("#timeStamp").val());
      $.ajax({
        url: `/api/reserve/${eventId}`,
        type: "POST",
        data: {
          time: timeStamp,
        },
        success: function (result) {
          console.log(result);
        //   $("#playerName").attr("placeholder", result.playerName);
        //   $("#playerName").val("");
        //   success("Player name updated!");
        },
      });
    } catch (e) {
      error(e.error);
    }
  });