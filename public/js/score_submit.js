$("form").on("submit", function (event) {
  event.preventDefault();
  const createEvent = {
    method: "POST",
    url: "/api/events",
    contentType: "application/json",
    data: JSON.stringify({
      eventName: eventNameInput,
      eventDate: eventDateInput,
      eventType: eventTypeInput,
    }),
  };
  $.ajax(createEvent).then(function (responseMessage) {
    console.log(responseMessage);
    output.innerText = "Created!";
  });
});
