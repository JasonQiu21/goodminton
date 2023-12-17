(function($) {
    let div = $('#roundrobin-div');
    function getEventId() {
        const url = window.location.pathname.split('/');
        return url[2];
    }
    let eventId = getEventId();
    let requestRoundRobin = {
        method: 'POST',
        url: `/api/events/${eventId}/generateBracket`,
        contentType: 'application/json',
        data: JSON.stringify({
            seeded: true
        })
    };
    $.ajax(requestRoundRobin).then(function(responseMessage) {
        console.log(responseMessage);
        let table = $(
            `<table>
                <tr>
                    <th>Team 1</th>
                    <th>Scores</th>
                    <th>Team 2</th>
                </tr>
            </table>
            `
        );
        let row;
        for (let match of responseMessage.matches.round){
            if (responseMessage.eventType === "singles tournament") {
                // singles
                row = $(
                    `<tr>
                        <td>
                            ${match.team1[0].playerName}
                        </td>
                        <td>
                            ${match.score[0]}:${match.score[1]}
                        </td>
                        <td>
                            ${match.team2[0].playerName}
                        </td>
                    </tr>
                    `
                );
            }
            else {
                // doubles
                row = $(
                    `<tr>
                        <td>
                            ${match.team1[0].playerName}
                            ${match.team1[1].playerName}
                        </td>
                        <td>
                            ${match.score[0]}:${match.score[1]}
                        </td>
                        <td>
                            ${match.team2[0].playerName}
                            ${match.team2[1].playerName}
                        </td>
                    </tr>
                    `
                );
            }
            table.append(row);


        }
        div.append(table);
    })
})(window.jQuery);