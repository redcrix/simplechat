const moment = require('moment');

function formatMessage(user_id, username, text){
    return {
        user_id,
        username,
        text,
        time: moment().format('h:mm a'),
        date: moment().format('YYYY-MM-DD')
    }
}

module.exports = formatMessage;