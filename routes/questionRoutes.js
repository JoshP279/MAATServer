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
 * Route for adding a question to the database
 * @param {String} Question - question to be added
 * @param {String} MarkAllocation - mark allocation for the question
 */
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

/**
 * Route for getting question marks for a submission
 * @param {String} SubmissionID - ID of the submission
 * @returns {Object} - JSON object containing question marks
 * @throws {Object} - JSON object containing error message
 */
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