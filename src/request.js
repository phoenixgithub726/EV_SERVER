const http = require('http');
const https = require('https');
const url = require('url');
const querystring = require('querystring');

const protocols = {
    'http:': http,
    'https:': https
};

function send(link, method, params, headers, counter) {
    return new Promise((resolve, reject) => {
        link = url.parse(link);
        var postData;
        var options = {
            method: method || 'GET',
            hostname: link.hostname,
            path: link.path,
            headers: {}
        };

        if (headers) {
            // !headers[1]&&( headers= [headers] );
            headers.forEach((header) => {
                options.headers[header[0]] = header[1];
            });
        }

        if (options.headers['Content-Type'] == 'application/json') {
            postData = JSON.stringify(params);
        } else if (options.method == 'POST' || options.method == 'PUT') {
            postData = querystring.stringify(params || {});
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        function doRequest(tries) {
            const req = protocols[link.protocol]
                .request(options, (resp) => {
                    let response = '';

                    resp.on('data', (data) => {
                        response += data;
                    }).on('end', (data) => {
                        if (resp.headers['content-type'] == 'application/json') {
                            response = JSON.parse(response);
                        }
                        if ((resp.statusCode == 200) | (resp.statusCode == 201)) {
                            return resolve(response);
                        } else if (resp.statusCode == 500 && tries < 3) {
                            console.warn('problem with url ', link);
                            req.end();
                            return doRequest(tries + 1);
                        }
                        console.warn('something wrong with ', link, resp.statusCode);
                        reject(response);
                    });
                })
                .on('error', (err) => reject(err));
            if (postData && (options.method == 'PUT' || options.method == 'POST')) {
                req.write(postData);
            }

            req.end();
        }
        doRequest(0);
    });
}

send.all = function (conf) {
    return Promise.all(conf.map((d) => send(...d)));
};

module.exports = send;
