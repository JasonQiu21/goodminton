const isNonEmptyString = (str) => typeof str === 'string' && !!(str.trim());
const validateFormSubmission = () => {
    let eventNameInput = document.getElementById('eventNameInput').value.trim();
    let eventDateInput = document.getElementById('eventDateInput').value.trim();
    let eventTypeInput = document.getElementById('eventTypeInput').value.trim();
    if (!isNonEmptyString(eventNameInput)) return "Invalid event name";
    if (!isNonEmptyString(eventDateInput)) return "Invalid event date";
    if (!isNonEmptyString(eventTypeInput)) return "Invalid event type";
}
document.addEventListener("submit", (event) => {

})