const express = require('express');
const router = express.Router();

let clients;

function setClients(clientInstance) {
    clients = clientInstance;
}

router.get('/login', (req, res) => {
    const { MarkerEmail, Password } = req.query;
    clients.login(MarkerEmail, Password)
        .then(loginStatus => {
            if (loginStatus) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(400).json({ error: 'Invalid username or password' });
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Server error' });
        });
});

module.exports = {router,setClients};