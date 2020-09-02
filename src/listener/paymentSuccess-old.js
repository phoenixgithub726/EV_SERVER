'use strict';

const Stripe = require('../stripe');
const Utils = require('../utils');

/**
 * @summary                 Event Listener for 'paymentSuccess' message
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
    try {
        const email = socket.SESSION_VARS['email']
        const paymentIntent = await Stripe.getPaymentIntentById(message.data.paymentIntent.id);
        const val = parseInt(paymentIntent.description);
        if (paymentIntent && paymentIntent.status == 'succeeded') {
            try {
                const customer = await Stripe.getCustomerByEmail(email);
                await Stripe.updateCustomer(customer.id, {
                    ...current.metadata,
                    'Credit Balance': currentCredits + val
                });
                Utils.socket.sendData(socket, 'update', { credits: customer.balance, history: customer.metadata });
            } catch (e1) {
                Utils.socket.sendError(socket, e1);
            }
        } else {
            Utils.socket.sendError(socket, 'Failed in getting payment intent.');
        }
    } catch (e2) {
        Utils.socket.sendError(socket, e2);
    }
};
