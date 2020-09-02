'use strict';

const PipeDrive = require('../pipedrive');
const Stripe = require('../stripe');
const Utils = require('../utils');
const ZeroBounce = require('../zerobounce');

/**
 * @summary                 Event Listener for 'getFile' message
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
    try {
        if (message.data && message.data.id) {
            const fileId = message.data.id;
            const res = await ZeroBounce.getStatus(fileId);
            Utils.socket.sendData(socket, 'file', res.replace(/ZB /g, ''));
        } else {
            Utils.socket.sendError(socket, 'Invalid parameter for getFile');
        }
    } catch (e) {
        Utils.socket.sendError(socket, e);
        Utils.print.error(e);
    }
};
