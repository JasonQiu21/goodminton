(function($) {
    let div = $('#swiss-div');
    function getEventId() {
        const url = window.location.pathname.split('/');
        return url[2];
    }
    function getPlayerNames(match) {
        let team1 = [];
        let team2 = [];
        for (let player of match.team1) {
            team1.push(player.playerName);
        }
        if (typeof(match.team2) === "object") {
            for (let player of match.team2) {
                team2.push(player.playerName);

        }
        }
        else {
            team2.push("bye");
        }
        return [team1.join(", "), team2.join(", ")];
    }
    let eventId = getEventId();
    let requestSwiss = {
        method: 'GET',
        url: `/api/events/${eventId}`,
        contentType: 'application/json'
    };
    $.ajax(requestSwiss).then(function(responseMessage) {
        console.log(responseMessage);

        let row;
        for (let swissround of Object.keys(responseMessage.matches)){
            let table = $(
                `
                <table>
                    <tr>
                        <th>Team 1</th>
                        <th>Scores</th>
                        <th>Team 2</th>
                    </tr>
                </table>
                `
            );
            if (swissround.includes('swissround')) {
                for (let match of responseMessage.matches[swissround]) {
                    let [team1, team2] = getPlayerNames(match);
                    row = $(
                            `<tr>
                                <td>
                                    
                                    ${team1}
                                </td>
                                <td>
                                    ${match.score[0]}:${match.score[1]}
                                </td>
                                <td>
                                    ${team2}
                                </td>
                            </tr>
                            `
                        );
                    table.append(row);
                }
                div.append(`<label>
                ${swissround.toString()}
                </label>`);
                div.append(table);
            }

            
        }
    })
})(window.jQuery);