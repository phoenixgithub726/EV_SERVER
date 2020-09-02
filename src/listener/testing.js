'use strict';
const Utils = require('../utils');
/**
 * @summary                 Event Listener for 'introduce' message. At this time api_token is set and will be used for almost listener.
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
    // api_token session variables for user.
    console.log("message", message)
    Utils.socket.sendData(socket, 'testing', {
        credits: 100,
        email: 'testing@email',
        type: 'testing'
    });

};

