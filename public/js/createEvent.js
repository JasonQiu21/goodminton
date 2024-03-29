const isNonEmptyString = (str) => typeof str === "string" && !!str.trim();
function isValidDate(dateString) {
  var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regEx)) return false; // Invalid format
  var d = new Date(dateString);
  var dNum = d.getTime();
  if (!dNum && dNum !== 0) return false; // NaN value, Invalid date
  return d.toISOString().slice(0, 10) === dateString;
}
const isValidNumber = (num, name = "Number input") => {
  if (typeof num !== "number")
    throw { status: 400, error: `${name} is not a number.` };
  if (!(!!num || num === 0))
    throw { status: 400, error: `${name} is not a valid number.` };

  return num;
};

const validateFormSubmission = () => {
  let eventNameInput = document.getElementById("eventNameInput").value.trim();
  let eventDateInput = document.getElementById("eventDateInput").value.trim();
  let eventTypeInput = document
    .getElementById("eventTypeInput")
    .value.trim()
    .toLowerCase();
  let tournamentTypeInput = document
    .getElementById("tournamentTypeInput")
    .value.trim()
    .toLowerCase();
  let eventCapInput = parseInt(
    document.getElementById("eventCapInput").value.trim()
  );

  if (!isNonEmptyString(eventNameInput)) return "Invalid event name";
  if (!isNonEmptyString(eventDateInput)) return "Invalid event date";
  if (!isNonEmptyString(eventTypeInput)) return "Invalid event type";
  if (!isNonEmptyString(tournamentTypeInput)) return "Invalid tournament type";

  const validDate = isValidDate(eventDateInput);
  const validNum = isValidNumber(eventCapInput);
  if (!validDate) return "Invalid event date";
  eventDateInput = new Date(eventDateInput).getTime() / 1000;
  if (!validNum) return "Invalid event capacity";
  if (
    !["doubles tournament", "singles tournament", "practice"].includes(
      eventTypeInput.toLowerCase()
    )
  )
    return "Invalid event type";
  if (
    !["none", "single elim", "double elim", "round robin", "swiss"].includes(
      tournamentTypeInput.toLowerCase()
    )
  )
    return "Invalid tournament type";
  return [
    eventNameInput,
    eventDateInput,
    eventTypeInput,
    tournamentTypeInput,
    eventCapInput,
  ];
};
// document.addEventListener("submit", (event) => {
//     let output = document.getElementById('output-error');
//     output.innerHTML = "";
//     let error = validateFormSubmission();
//     if (error) {
//         output.innerText = error;
//         event.preventDefault();
//     }
// })

$("form").on("submit", function (event) {
  event.preventDefault();
  let output = document.getElementById("output-error");
  output.innerHTML = "";
  let result = validateFormSubmission();
  if (typeof result === "string") {
    output.innerText = result;
  } else {
    let [
      eventNameInput,
      eventDateInput,
      eventTypeInput,
      tournamentTypeInput,
      eventCapInput,
    ] = result;
    const createEvent = {
      method: "POST",
      url: "/api/events",
      contentType: "application/json",
      data: JSON.stringify({
        eventName: eventNameInput,
        eventDate: eventDateInput,
        eventType: eventTypeInput,
        tournamentType: tournamentTypeInput,
        eventCap: eventCapInput,
      }),
      success: function (result) {
        output.innerText = "Created!";
      },
      error: function (error) {
        output.innerText = error.responseJSON.error;
      }
    };
    $.ajax(createEvent)
  }
});
