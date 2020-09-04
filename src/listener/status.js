'use strict';

const PipeDrive = require('../pipedrive');
const Stripe = require('../stripe');
const Utils = require('../utils');

const defaultBalance = 100;
const minPurchase = 200;
const maxPurchase = 5000000;
const defaultPurchase = 2000;
const messages = [`Welcome to certalink email validator!\nFirst ${defaultBalance} credits are on us!`];
const prices = {
    5000: [0.008, '200 to 5K', '40 minutes'],
    10000: [0.0078, '5K to 10K', '40 minutes'],
    100000: [0.0065, '10K to 100K', '40 minutes'],
    250000: [0.0039, '100K to 250K', '40 minutes'],
    500000: [0.003, '250K to 500K', '40 minutes'],
    1000000: [0.0022, '500K to 1M', '40 minutes'],
    2000000: [0.00159, '1M to 2M', '40 minutes'],
    5000000: [0.001385, '2M to 5M', '40 minutes']
};

/**
 * @summary                 Event Listener for 'introduce' message. At this time api_token is set and will be used for almost listener.
 * @param {any}     socket  connected websocket
 * @param {any}     message
 */
module.exports = async function (socket, message) {
    // api_token session variables for user.
    socket.SESSION_VARS['api_token'] = message.data.token;
    socket.SESSION_VARS['user_id'] = message.data.id;
    if (socket.SESSION_VARS['api_token']) {
        // getUserById
        PipeDrive.getUserById(socket.SESSION_VARS['api_token'], socket.SESSION_VARS['user_id'])

        // PipeDrive.getMyInfo(socket.SESSION_VARS['api_token'])
            .then(async (me) => {
                // api_token session variables for user.
                socket.SESSION_VARS['email'] = me.data.email;
                socket.SESSION_VARS['userid'] = me.data.id;
                console.log("email, userid", me.data.email, me.data.id)
                try {
                    // try to retrieve Customer object for me.
                    const customer = await Stripe.getCustomerByEmail(socket.SESSION_VARS['email']);
                    if (customer && !customer.deleted) {
                        // Utils.print.log('Customer retrived', customer);
                        sendStatus(socket, customer);
                        return;
                    }
                    // If Customer is not created yet (it is the first call), create new Customer.
                    const newCustomer = await Stripe.createCustomer(
                        socket.SESSION_VARS['email'],
                        socket.SESSION_VARS['userid'],
                        defaultBalance
                    );
                    sendStatus(socket, newCustomer);
                    Utils.print.log('New customer created', newCustomer);
                } catch (e) {
                    Utils.print.error('Failed in Introduction. ', e);
                }
            })
            .catch((err) => {
                Utils.socket.sendError(socket, err);
            });
    } else {
        Utils.socket.sendError(socket, 'Invalid api token in request paramenter.\nContact to your administrator.');
    }
};

function sendStatus(socket, customer) {
    Utils.socket.sendData(socket, 'status', {
        credits: customer.metadata['Credit Balance'],
        email: customer.email,
        messages,
        prices,
        minPurchase,
        maxPurchase,
        defaultPurchase,
        history: customer.metadata
    });
}
