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

router.put('/updateQuestionMark', (req, res) => {
    console.log(req.body);
    const { submissionID, questionID,markAllocation} = req.body;
    clients.handleQuestionPerMark(submissionID, questionID, markAllocation)
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(500).json({ error: 'Failed to update question mark' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

router.get('/questionPerMark', (req, res) => {
    const submissionID = req.query.SubmissionID;
    console.log(submissionID);
    clients.questionPerMark(submissionID)
        .then(questionPerMark => {
            if (questionPerMark) {
                res.status(200).json(questionPerMark);
            } else {
                res.status(404).json({ error: 'No question marks found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});
module.exports = {router,setClients};