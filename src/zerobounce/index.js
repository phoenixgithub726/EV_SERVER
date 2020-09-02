'use strict';

const { CONFIG } = require('../../config');
const httpTransport = require('https');
const request = require('../request');

const responseEncoding = CONFIG.ZEROBOUNCE.RESPONSE_ENCODING;
const httpOptions = CONFIG.ZEROBOUNCE.OPTIONS;

/**
 * Class for ZeroBounce
 */
class ZeroBounce {
    /**
     * @summary Get status of file
     * @param {string} fileId identification of file which were stored already
     * @return Promise<string>
     */
    static getStatus(fileId) {
        return request(`https://bulkapi.zerobounce.net/v2/filestatus?api_key=${CONFIG.ZEROBOUNCE.KEY}&file_id=${fileId}`);
    }
    /**
     * @summary Send string formated as CSV and return as JSON
     * @param {string} csv
     * @return Promise<string>
     */
    static sendCSV(csv) {
        return new Promise((resolve, reject) => {
            const request = httpTransport
                .request(httpOptions, (res) => {
                    const responseBufs = [];
                    let responseStr = '';

                    res.on('data', (chunk) => {
                        if (Buffer.isBuffer(chunk)) {
                            responseBufs.push(chunk);
                        } else {
                            responseStr = responseStr + chunk;
                        }
                    }).on('end', () => {
                        responseStr = responseBufs.length > 0 ? Buffer.concat(responseBufs).toString(responseEncoding) : responseStr;
                        resolve(responseStr);
                    });
                })
                .setTimeout(0)
                .on('error', (err) => {
                    reject(`ZeroBounce ==> Failed in sendCSV. Detail: ${err}`);
                });

            request.write(
                `--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"file\"; filename=\"zerobounce.csv\"\r\nContent-Type: text/csv\r\n\r\n${csv}\r\n--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"api_key\"\r\n\r\n${CONFIG.ZEROBOUNCE.KEY}\r\n--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"email_address_column\"\r\n\r\n1\r\n--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"first_name_column\"\r\n\r\n2\r\n--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"last_name_column\"\r\n\r\n3\r\n--__BOUNDARY__\r\nContent-Disposition: form-data; name=\"has_header_row\"\r\n\r\ntrue\r\n--__BOUNDARY__--\r\n`
            );
            request.end();
        });
    }

    /**
     * @summary Get file by id
     * @param {string} fileId
     * @return string of file content
     */
    static getFile(fileId) {
        return request(`https://bulkapi.zerobounce.net/v2/getfile?api_key=${CONFIG.ZEROBOUNCE.KEY}&file_id=${fileId}`);
    }
}
module.exports = ZeroBounce;
