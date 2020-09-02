'use strict';

const Server = require('./src/server');
const Config = require('./config');
const Utils = require('./src/utils')

Server.getInstance().start();
Utils.print.log(`Server v${Config.CONFIG.VERSION} is starting at 0.0.0.0 : ${Config.CONFIG.PORT}`)