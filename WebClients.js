const axios = require('axios');
const { query } = require('express');
class WebClients{
    constructor(pool){
        this.pool = pool;
    }
    async login(MarkerEmail, Password) {
        const query = `SELECT * FROM marker WHERE MarkerEmail = ? AND Password = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.length > 0); // Return true if user found
                }
            });
        });
    }
}
module.exports = WebClients;