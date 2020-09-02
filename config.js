'use strict';
const CONSTANT = {
    PRINT_LOG: 1,
    PRINT_WARN: 2,
    PRINT_ERROR: 4,
    PRINT_ALL: 7,
    PRINT_NONE: 0
};
exports.CONSTANT = CONSTANT;
exports.CONFIG = {
    VERSION: '0.0.1',
    HOST: '127.0.0.1',
    PORT: 8888,
    PRINT: CONSTANT.PRINT_ALL,
    STRIPE: {
        // KEY: 'sk_test_TRbIF0YhBBlz7VLFxq2XL2ow'
        KEY: 'sk_test_51GsJaTENKR3DelSmqzTVwXFQNnL6PZBFwKqdENmubmXdTOPsYbcHxanm0xNO2GrFlbkmPKG02fpupFFdtRgCe4ZD00PFUKAGts'
        // KEY: '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'

    },
    ZEROBOUNCE: {
        KEY: '2994e60cdf954aa4a943e28d3872226c',
        RESPONSE_ENCODING: 'utf8',
        OPTIONS: {
            hostname: 'bulkapi.zerobounce.net',
            port: '443',
            path: '/v2/sendfile',
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data; charset=utf-8; boundary=__BOUNDARY__',
                'User-Agent': 'node ' + process.version,
                Cookie:
                    '__cfduid=d5b6147a331147ae473f4e708ce3161ec1579363919; __cflb=02DiuJXghHGgGEKfEQat4dWjeaJhkyd5pHpcNqzkMLgAg; __cf_bm=70720f8d5986ae4c39bc9ad1e832b805dceee378-1579364991-1800-AfIIpPfz2TS7wln/dFhTI2onxHhfyalP4Pg5kIA+4wAjViwTzKkHTY4NWRTsdhqmhLKXvDNAjXs8gYyjE2Q+VnE='
            }
        }
    },
    MAIL: {
        CURRENT: 'GMAIL', // can be 'YANDEX' or 'PROTONMAIL'
        MAILS: {
            GMAIL: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'your-name@gmail.com',
                    pass: 'your-password'
                }
            },
            YANDEX: {
                host: 'smtp.yandex.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'modi34@yandex.ru',
                    pass: 'kk2RKfn9CD?X4VqgAjjej9@7Et{REKGMk/VydLxoW9w>&*CP;e'
                }
            },
            PROTONMAIL: {
                host: '127.0.0.1',
                port: 1025,
                secure: true,
                auth: {
                    user: 'your-name@protonmail.com',
                    pass: 'bridge-password'
                }
            }
        }
    }
};
