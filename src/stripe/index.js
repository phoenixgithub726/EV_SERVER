'use strict';

const Utils = require('../utils');
const { CONFIG } = require('../../config');
const _stripe = require('stripe')(CONFIG.STRIPE.KEY);
/**
 * Class to implement stripe for get infomation of customers, payment and so on.
 */
class Stripe {
    /**
     * @summary Get customer by pipedrive user id.
     * @param {number} userid PipeDrive userid
     * @return {Promise<customer>} If failed in getting customer, it will return null.
     */
    static getCustomerByPipeDriveUserId(userid) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.list({}, function (err, customers) {
                    if (err) {
                        resolve(null);
                    } else {
                        for (const customer of customers) {
                            if (customer.metadata.userid === userid) {
                                resolve(customer);
                                return;
                            }
                        }
                        resolve(null);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @summary Get customer by pipedrive user id.
     * @param {string} email
     * @return {Promise<customer>} If failed in getting customer, it will return null.
     */
    static getCustomerByEmail(email) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.list({ email }, function (err, customers) {
                    if (err) {
                        resolve(null);
                    } else {
                        if (customers.data.length > 1)
                            Utils.print.warn('Warning in getCustomerByEmail. Two or more customer were retrived.');
                        resolve(customers.data[0]);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @summary                     Class to retrive customer informations for specific user id.
     * @param {number} id           User id to identity user in pipedrive CRM.
     * @return                      Customer by id
     */
    static getCustomerById(id) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.retrieve(id.toString(), function (err, customer) {
                    if (err) {
                        resolve(null);
                    } else {
                        resolve(customer);
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    /**
     * @summary                 Class to create customer in stripe account
     * @param {number} balance  default balance
     * @param {string} email    user email
     * @param {number} userid   Pipedrive user id
     * @return                  new Customer
     */
    static createCustomer(email, userid, credit) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.create({ email, metadata: { 'PipeDrive User ID': userid, 'Credit Balance': credit } }, function (
                    err,
                    customer
                ) {
                    if (err) {
                        reject(`Stripe ==> Failed in createCustomer. Details: ${err}`);
                    } else {
                        resolve(customer);
                    }
                });
            } else {
                reject('Stripe ==> Failed in createCustomer. Details: stripe was not initialized.');
            }
        });
    }
    /**
     * @summary Set Metadata of customer with given it's id.
     * @param {string} id
     * @param {JSON} data
     * @return {Promise<customer>}
     */
    static updateCustomer(id, data) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.update(id, { metadata: data }, function (err, customer) {
                    if (err) {
                        reject(`Stripe ==> Failed in createCustomer. Details: ${err}`);
                    } else {
                        resolve(customer);
                    }
                });
            }
        });
    }
    /**
     * Delete customer. It can be used to delete permanently soft deleted customer.
     * @param {number} id
     */
    static deleteCustomer(id) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.customers.del(id.toString(), function (err, confirm) {
                    console.log('customer del', err, confirm);
                    resolve();
                });
            } else {
                reject('Stripe ==> Failed in deleteCustomer. Details: stripe was not initialized.');
            }
        });
    }
    /**
     * @summary Create payment
     * @param {number} amount
     * @param {string} description
     * @param {string} currency
     */
    static createPaymentIntent(amount, description, currency) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                description = description + " Email Validation Credits";
                _stripe.paymentIntents.create({ amount, description, currency }, function (err, paymentIntent) {
                    if (err) {
                        reject(`Stripe ==> Failed in createPaymentIntent. Details: ${err}`);
                    } else {
                        resolve(paymentIntent);
                    }
                });
            } else {
                reject('Stripe ==> Failed in createPaymentIntent. Details: stripe was not initialized.');
            }
        });
    }

    /**
     * @summary Get payment intent by id
     * @param {number} id payment intent id
     * @return paymentIntent
     */
    static getPaymentIntentById(id) {
        return new Promise((resolve, reject) => {
            if (_stripe) {
                _stripe.paymentIntents.retrieve(id, function (err, paymentIntent) {
                    if (err) {
                        reject(`Stripe ==> Failed in getPaymentIntentById. Details: ${err}`);
                    } else {
                        resolve(paymentIntent);
                    }
                });
            } else {
                reject('Stripe ==> Failed in getPaymentIntentById. Details: stripe was not initialized.');
            }
        });
    }
    /**
     * @summary add balance of customer
     * @param {number} id
     * @param {number} valance
     * @param {string} fileId
     * @return updated customer
     */
    static addCustomerBalance(id, valance, fileId = null) {
        return new Promise(async (resolve, reject) => {
            try {
                const customer = await Stripe.getCustomerById(id);
                const result = {
                    balance: customer.balance + valance
                };
                if (fileId) {
                    result.metadata = customer.metadata || {};
                    result.metadata[fileId] = valance * -1 + ',' + new Date().getTime();
                }
                _stripe.customers.update(id.toString(), result, function (err, updatedCustomer) {
                    if (err) {
                        reject(`Stripe ==> Failed in updateCustomerBalance. Detail: ${err}`);
                    } else {
                        resolve(updatedCustomer);
                    }
                });
            } catch (e) {
                reject(`Stripe ==> Failed in updateCustomerBalance. Details: ${e}`);
            }
        });
    }
}
module.exports = Stripe;
