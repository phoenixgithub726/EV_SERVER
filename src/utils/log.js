'use strict';

const CONFIG = require('../../config').CONFIG;
const CONSTANT = require('../../config').CONSTANT;
class Print {
    // Custom log print function
    static error(e1, e2) {
        if (CONFIG.PRINT & CONSTANT.PRINT_ERROR) console.error(new Date().toISOString() + '\tError: ', e1, e2);
    }
    static log(e1, e2) {
        if (CONFIG.PRINT & CONSTANT.PRINT_LOG) console.log(new Date().toISOString() + '\tLog: ', e1, e2);
    }
    static warn(e1, e2) {
        if (CONFIG.PRINT & CONSTANT.PRINT_WARN) console.warn(new Date().toISOString() + '\tWarning: ', e1, e2);
    }
}

module.exports = Print;
