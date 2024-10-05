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
        .then(results => {
            if (results) {
                res.status(200).json({MarkerRole : results[0].MarkerRole, MarkingStyle : results[0].MarkingStyle});
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

/**
 * Route to get all demi markers
 * @response {json} 200 - Demi markers if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/demiMarkers', (req, res) =>{
    clients.getDemiMarkers()
        .then(demiMarkers => {
            if (demiMarkers) {
                res.status(200).json(demiMarkers);
            } else {
                res.status(404).json({ error: 'No demi markers found' });
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
/**
 * Route to add a lecturer
 * @response {json} 200 - Lecturer added successfully
 * @response {json} 409 - Lecturer already exists
 * @response {json} 500 - Error message if server error
 */
router.put('/addLecturer', (req, res) => {
    const { MarkerEmail, Name, Surname, Password, MarkingStyle} = req.body;
    clients.addLecturer(MarkerEmail, Name, Surname, Password, 'Lecturer', MarkingStyle)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to add lecturer' });
            }
        })
        .catch(error => {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'Lecturer already exists' });
            }
            res.status(500).json({ error: 'Server Error' });
        });
});
/**
 * Route to add a lecturer
 * @response {json} 200 - Lecturer added successfully
 * @response {json} 500 - Error message if server error
 */
router.delete('/deleteMarker', (req, res) => {
    const { MarkerEmail } = req.query;
    clients.deleteMarker(MarkerEmail)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to delete marker' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to edit a lecturer
 * @response {json} 200 - Lecturer edited successfully
 * @response {json} 500 - Error message if server error
 */
router.put('/editLecturer', (req, res) => {
    const { MarkerEmail, Name, Surname, Password, MarkingStyle} = req.body;
    clients.editLecturer(MarkerEmail, Name, Surname, Password, MarkingStyle)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to edit lecturer' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to add a demi marker
 * @response {json} 200 - Demi Marker added successfully
 * @response {json} 409 - Demi Marker already exists
 * 
 */
router.put('/addDemiMarker', (req, res) => {
    const { MarkerEmail, Name, Surname, Password, MarkingStyle} = req.body;
    clients.addDemiMarker(MarkerEmail, Name, Surname, Password, 'Demi', MarkingStyle)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to add moderator' });
            }
        })
        .catch(error => {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'Moderator already exists' });
            }
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to delete a marker
 * @response {json} 200 - Marker deleted successfully
 * @response {json} 500 - Error message if server error
 */
router.put('/editMarker', (req, res) => {
    const { MarkerEmail, Name, Surname, Password, MarkingStyle} = req.body;
    clients.editMarker(MarkerEmail, Name, Surname, Password, MarkingStyle)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to edit marker' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

router.put('/updateMarkingStyle', (req, res) => {
    const { markingStyle, markerEmail } = req.body;
    clients.updateMarkingStyle(markerEmail, markingStyle)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to update marking style' });
            }
        })
}); 
module.exports = {router,setClients};