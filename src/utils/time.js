'use strict';

class Time {
    // Custom log print function
    /**
     * 
     * @param {number} elapse Milisecond to sleep.
     */
    static sleep(elapse) {
        return new Promise((resolve)=>{ setTimeout(()=>resolve(), elapse)})
    }
}

module.exports = Time;
