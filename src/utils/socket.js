'use strict';

const Print = require('./log');

class Socket {
    static sendData(socket, type, data) {
        Print.log(`Send to ${socket._socket.remoteAddress}`, { type, data });
        socket.send(JSON.stringify({ type, data }));
    }
    static sendError(socket, message) {
        Print.log(`Send to ${socket._socket.remoteAddress}`, {
            type: 'error',
            data: {
                email: socket.user_email,
                messages: message
            }
        });
        socket.send(
            JSON.stringify({
                type: 'error',
                data: {
                    email: socket.user_email,
                    messages: message
                }
            })
        );
    }
}
module.exports = Socket;
