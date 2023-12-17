$(".join-button").click(function (e) {
    console.log("button pressed");
    e.preventDefault();
    const eventId = window.location.pathname.split('/').at(-1);
    var timeStamp = $(this).attr("data-id")
    console.log(timeStamp);
    try {
      timeStamp = isValidString(timeStamp);
      $.ajax({
        url: `/api/events/reserve/${eventId}`,
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
      console.log(e);
    }
  });

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