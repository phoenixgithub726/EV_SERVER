'use strict';

const Utils = require('../utils');
const { CONFIG } = require('../../config');
const NodeMailer = require('nodemailer');
/**
 * Class to send email
 * Please check the ../config.js
 * You can set the information of Mail client at there such as Current Service, user name and password.
 * Attension! Don't modify key name: it is used for nodemailer module directly.
 */
class MailClient {
    /**
     * It is singleton class who has getInstance() method.
     * You can call the class instance anywhere like this: MailClient.getInstance()
     * The instance class is initialized at the first call.
     */
    static _inst = null;
    static getInstance() {
        if (!MailClient._inst) {
            MailClient._inst = new MailClient();
        }
        return MailClient._inst;
    }

    // initialize mail client
    constructor() {
        try {
            this.options = CONFIG.MAIL.MAILS[CONFIG.MAIL.CURRENT];
            this.transporter = NodeMailer.createTransport(this.options);
        } catch (e) {
            Utils.print.error('Mail==> Failed to initialize Mail client. Details: ', e);
        }
    }

    // Get current mail service configration options
    getOptions = () => {
        return this.options;
    };

    // Make message
    makeMessage = (to, subject, text, csv) => {
        //Check params
        if (!to || !subject || !text) {
            Utils.print.error("Mail==> Can't send the email. Parameter incorrect.");
            return null;
        }
        const message = {
            from: this.options.auth.user,
            to,
            subject,
            text
        };
        if (csv) {
            message.attachments = [
                {
                    filename: 'test.json.txt',
                    content: JSON.stringify(csv),
                    contentType: 'text/plain'
                }
            ];
        }
        return message;
    };

    // Main send function
    send = async (to, subject, text, csv) => {
        // Check if it was initialized correctly.
        if (!this.transporter) {
            Utils.print.error("Mail==> Can't send the email. Initialization was failed.");
            return false;
        }

        // make message
        const message = this.makeMessage(to, subject, text, csv);
        // send if message was build exactly.
        if (message) {
            try {
                await this.transporter.sendMail(message);
                Utils.print.log('Mail==> Send mail successfully: ' + message);
                return true;
            } catch (e) {
                Utils.print.error('Mail==> Failed to send mail', e);
            }
        }
        return false;
    };
}
module.exports = MailClient;
