'use strict';

class Global {
    static data = {};
    static set(key, value) {
        Global.data[key] = value;
    }
    static get(key) {
        return Global.data[key];
    }
}
module.exports = Global;
