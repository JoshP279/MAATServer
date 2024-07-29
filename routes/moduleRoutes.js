const express = require('express');
const router = express.Router();
let clients;

/**
 * Sets the clients object to the instance passed in
 * @param {Object} clientInstance - instance of the ClientThreads
 */
function setClients(clientInstance) {
    clients = clientInstance;
}

/**
 * Route to get all modules
 * GET /modules
 * @response {json} 200 - Modules if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/modules', (req, res) => {
    clients.getModules()
        .then(modules => {
            if (modules) {
                res.status(200).json(modules);
            } else {
                res.status(404).json({ error: 'No modules found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

module.exports = {router,setClients};