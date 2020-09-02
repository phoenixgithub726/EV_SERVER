'use strict';

class Csv {
    /**
     * @summary Parse csv string to dict
     * @param {string} csv
     * @return dictionary
     */
    static parse(csv) {
        csv = csv.replace(/"/g, '');

        const rows = csv.split('\n');
        const headers = rows.shift().split(',');
        const parsed = {};

        for (const row of rows) {
            const columns = row.split(',');
            const column = {};
            for (let i in columns) {
                column[headers[i]] = columns[i];
            }
            parsed[columns[0]] = column;
        }
        return parsed;
    }
}
module.exports = Csv;
