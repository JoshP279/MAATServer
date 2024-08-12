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

/**
 * Route to add a module
 * @response {json} 200 - Module added successfully
 * @response {json} 409 - Module already exists
 * @response {json} 500 - Error message if server error
 */
router.put('/addModule', (req, res) => {
    const { ModuleCode, ModuleName } = req.body;
    clients.addModule(ModuleCode, ModuleName)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to add module' });
            }
        })
        .catch(error => {
            console.error(error);
            if (error.code === 'ER_DUP_ENTRY') {
                res.status(409).json({ error: 'Module already exists' });
            }
            res.status(500).json({ error: 'Server Error' });
        });
});
/**
 * Route to edit a module
 * @response {json} 200 - Module edited successfully
 * @response {json} 500 - Error message if server error
 * @response {json} 404 - Error message if module not found
 */
router.delete('/deleteModule', (req, res) => {
    const { ModuleCode } = req.query;
    console.log(ModuleCode);
    clients.deleteModule(ModuleCode)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: 'Failed to delete module' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});
/**
 * Route to edit a module
 * @response {json} 200 - Module edited successfully
 * @response {json} 500 - Error message if server error
 * @response {json} 404 - Error message if module not found
 */
router.put('/editModule', (req, res) => {
    const { ModuleCode, ModuleName } = req.query;
    clients.editModule(ModuleCode, ModuleName)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(404).json({ error: 'Failed to edit module' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

module.exports = {router,setClients};