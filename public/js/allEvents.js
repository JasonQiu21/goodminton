(function($) {
    let allEvents = $('#allEvents');
    let requestAllEvents = {
        method: 'GET',
        url: 'api/events'
    };
    $.ajax(requestAllEvents).then(function (responseMessage) {
        console.log(responseMessage);
        let today = Date.now();
        today = Math.floor(today / 1000);
        let element;
        responseMessage.map((event) => {
            if (event.date >= today) {
                console.log('future');
                element = $(
                    `<a href='/events/${event._id}'>${event.name}</a>
                    <br>`
                )
                allEvents.append(element);
            }
        })
        if (allEvents.is(':empty')) {
            allEvents.append('<a>No upcoming events, stay tuned for updates!</a>')
        }
    })
})(window.jQuery);