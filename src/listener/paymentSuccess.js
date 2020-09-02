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
        // const email = socket.SESSION_VARS['email']
        const email = message.data.email
        console.log("SESSION_VARS email", email)
        const paymentIntent = await Stripe.getPaymentIntentById(message.data.paymentIntent.id);
        const val = parseInt(paymentIntent.description);
        if (paymentIntent && paymentIntent.status == 'succeeded') {
            try {
                let customer = await Stripe.getCustomerByEmail(email);
                
                console.log("customer by email", customer)
                await Stripe.updateCustomer(customer.id, {
                    ...customer.metadata,
                    'Credit Balance':parseInt(customer.metadata['Credit Balance'])  + parseInt( val)
                    // 'Credit Balance': 0  
                });
                
                customer = await Stripe.getCustomerByEmail(email);
                console.log("updateedcustomer:", customer)
                console.log("custoupdatemer-:", parseInt(customer.metadata['Credit Balance']))
                Utils.socket.sendData(socket, 'update', {state: "payment", credits: customer.metadata['Credit Balance'], history: customer.metadata });
                // Utils.socket.sendData(socket, 'update', { credits: customer.balance, history: customer.metadata });
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
