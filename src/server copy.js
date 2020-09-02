'use strict';
/**
 * Main server class
 */
const WebSocket = require('ws');
const Utils = require('./utils');
const MailClient = require('./email');
const EventListener = require('./listener');

class Server {
    /**
     * It is singleton class who has getInstance() method.
     * You can call the class instance anywhere like this: Server.getInstance()
     * The instance class is initialized at the first call.
     */
    static _inst = null;
    static getInstance() {
        if (!Server._inst) {
            Server._inst = new Server();
        }
        return Server._inst;
    }
    constructor() {}
    start() {
        this.wss = new WebSocket.Server({ 
            host: require('../config').CONFIG.HOST,
            port: require('../config').CONFIG.PORT
         });
        this.wss.on('connection', function (socket) {
            socket.SESSION_VARS = {
                started: new Date(),
                ip: socket._socket.address().address,
                port: socket._socket.address().port
            }
            socket.on('message', function (msg) {
                Utils.print.log(`Received from ${socket.SESSION_VARS['ip']}:${socket.SESSION_VARS['port']} ==> ${msg}`);
                const message = JSON.parse(msg);
                const listener = EventListener[message.type];
                if (listener) {
                    listener(socket, message);
                } else {
                    Utils.socket.sendError(socket, 'No proper listener was delacred.');
                }
            });
        });
        // MailClient.getInstance().send('modi341@gmail.com', 'server restarted', 'email on server works').catch(console.error);
    }
}
module.exports = Server;
