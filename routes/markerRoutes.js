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
 * Route to attempt login
 * GET /login
 * @Query {string} MarkerEmail - Email of the marker.
 * @Query {string} Password - Password of the marker.
 * @response {json} 200 - Role of the marker if found
 * @response {json} 400 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/login', (req, res) => {
    const { MarkerEmail, Password } = req.query;
    clients.login(MarkerEmail, Password)
        .then(login => {
            if (login) {
                res.status(200).json({MarkerRole : login});
            } else {
                res.status(400).json({ error: 'Invalid username or password' });
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Server error' });
        });
});

/**
 * Route to get all lecturers
 * GET /lecturers
 * @response {json} 200 - Lecturers if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/lecturers', (req, res) => {
    clients.getLecturers()
        .then(lecturers => {
            if (lecturers) {
                res.status(200).json(lecturers);
            } else {
                res.status(404).json({ error: 'No lecturers found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

/**
 * Route to get all moderators
 * GET /moderators
 * @response {json} 200 - Moderators if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/moderators', (req, res) => {
    clients.getModerators()
        .then(moderators => {
            if (moderators) {
                res.status(200).json(moderators);
            } else {
                res.status(404).json({ error: 'No Moderators found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});
/**
 * Route to get all markers
 * GET /markers
 * @response {json} 200 - Markers if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/markers', (req, res) =>{
    clients.getMarkers()
        .then(markers => {
            if (markers) {
                res.status(200).json(markers);
            } else {
                res.status(404).json({ error: 'No markers found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

module.exports = {router,setClients};