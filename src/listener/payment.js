'use strict';

const Stripe = require('../stripe');
const Utils = require('../utils');

/**
 * @summary                 Event Listener for 'payment' message
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
    try {
        const credits = parseInt(message.data.amount);
        const pricePlan = getPricePlanByCredits(credits);
        console.log('credits',credits)
        console.log('pricePlan',pricePlan)
        console.log('paymentIntent')
        console.log(credits * pricePlan.price * 100, credits.toString(), 'usd')
        if (pricePlan) {
            const paymentIntent = await Stripe.createPaymentIntent(credits * pricePlan.price * 100, credits.toString(), 'usd');
            Utils.socket.sendData(socket, 'payment', { secret: paymentIntent.client_secret, tabId: message.data.tabId });
        } else {
            Utils.socket.sendError(socket, 'Invalid credits amount');
        }
    } catch (e) {
        Utils.print.error(e);
        Utils.socket.sendError(socket, e);
    }
};
const _pricePlans = {
    5000: { price: 0.008, description: '200 to 5K', dueTo: '40 minutes' },
    10000: { price: 0.0078, description: '5K to 10K', dueTo: '40 minutes' },
    100000: { price: 0.0065, description: '10K to 100K', dueTo: '40 minutes' },
    250000: { price: 0.0039, description: '100K to 250K', dueTo: '40 minutes' },
    500000: { price: 0.003, description: '250K to 500K', dueTo: '40 minutes' },
    1000000: { price: 0.0022, description: '500K to 1M', dueTo: '40 minutes' },
    2000000: { price: 0.00159, description: '1M to 2M', dueTo: '40 minutes' },
    5000000: { price: 0.001385, description: '2M to 5M', dueTo: '40 minutes' }
};
function getPricePlanByCredits(credits) {
    for (const planIndex in _pricePlans) {
        if (planIndex >= credits) {
            return _pricePlans[planIndex];
        }
    }
}
