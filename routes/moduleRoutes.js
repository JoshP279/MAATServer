const express = require('express');
const router = express.Router();
let clients;
function setClients(clientInstance) {
    clients = clientInstance;
}
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