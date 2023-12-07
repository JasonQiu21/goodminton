const isNonEmptyString = (str) => typeof str === 'string' && !!(str.trim());
function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    var dNum = d.getTime();
    if(!dNum && dNum !== 0) return false; // NaN value, Invalid date
    return d.toISOString().slice(0,10) === dateString;
}
const validateFormSubmission = () => {
    let eventNameInput = document.getElementById('eventNameInput').value.trim();
    let eventDateInput = document.getElementById('eventDateInput').value.trim();
    let eventTypeInput = document.getElementById('eventTypeInput').value.trim().toLowerCase();
    if (!isNonEmptyString(eventNameInput)) return "Invalid event name";
    if (!isNonEmptyString(eventDateInput)) return "Invalid event date";
    if (!isNonEmptyString(eventTypeInput)) return "Invalid event type";
    const validDate = isValidDate(eventDateInput);
    if (!validDate) return "Invalid event date";
    eventDateInput = new Date(eventDateInput).getTime()/1000;
    if (!["doublestournament", "singlestournament", "practice"].includes(eventTypeInput.toLowerCase())) return "Invalid event type";
    return [eventNameInput, eventDateInput, eventTypeInput];
}
// document.addEventListener("submit", (event) => {
//     let output = document.getElementById('output-error');
//     output.innerHTML = "";
//     let error = validateFormSubmission();
//     if (error) {
//         output.innerText = error;
//         event.preventDefault();
//     }
// })

$('form').on("submit", function(event) {
    event.preventDefault();
    let output = document.getElementById('output-error');
    output.innerHTML = "";
    let result = validateFormSubmission();
    if (typeof(result) === "string") {
        output.innerText = result;
    }
    else {
        let [eventNameInput, eventDateInput, eventTypeInput] = result;
        const createEvent = {
            method: 'POST',
            url: '/api/events',
            contentType: 'application/json',
            data: JSON.stringify({
                eventName: eventNameInput,
                eventDate: eventDateInput,
                eventType: eventTypeInput
            })
        };
        $.ajax(createEvent).then(function (responseMessage){
            console.log(responseMessage);
            output.innerText = "Created!";
        })
    }

});