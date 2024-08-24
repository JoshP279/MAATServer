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
 * Route to get the memorandum PDF for a specific assessment
 * GET /memoPDF
 * @Query {string} AssessmentID - ID of the assessment.
 * @response {json} 200 - PDF data if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 */
router.get('/memoPDF', (req, res) => {
    const assessmentID = req.query.AssessmentID;
    clients.getMemoPDF(assessmentID)
        .then(pdfData => {
            if (pdfData) {
                res.status(200).json({ pdfData });
            } else {
                res.status(404).json({ error: 'Memorandum PDF not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to add a new assessment.
 * PUT /addAssessment
 * @body {Object} assessmentInfo - Information about the assessment.
 * @response {json} 200 - Success message with assessment ID.
 * @response {json} 404 - If no assessments are found.
 * @response {json} 500 - On server error.
 */
router.put('/addAssessment', (req, res) => {
    const assessmentInfo = req.body;
    const memoObject = assessmentInfo.Memorandum;
    const memoBuffer = Buffer.from(Object.values(memoObject));
    clients.addAssessment(assessmentInfo.LecturerEmail, assessmentInfo.MarkerEmail, assessmentInfo.AssessmentName, assessmentInfo.ModuleCode, memoBuffer, assessmentInfo.ModEmail, assessmentInfo.TotalMark, assessmentInfo.NumSubmissionsMarked, assessmentInfo.TotalNumSubmissions, assessmentInfo.AssessmentType)
        .then(resultId => {
            if (resultId) {
                res.status(200).json({ message: 'Assessment added successfully', assessmentID: resultId });
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

/**
* Route to edit an existing assessment.
* PUT /editAssessment
* @body {Object} assessmentInfo - Updated information about the assessment.
* @response {json} 200 - Success message.
* @response {json} 404 - If no assessments are found.
* @response {json} 500 - On server error.
*/
router.put('/editAssessment', (req, res) => {
    const assessmentInfo = req.body;
    const memoObject = assessmentInfo.Memorandum;
    const memoBuffer = Buffer.from(Object.values(memoObject));
    clients.editAssessment(assessmentInfo.AssessmentID, assessmentInfo.MarkerEmail, assessmentInfo.AssessmentName, assessmentInfo.ModuleCode, memoBuffer, assessmentInfo.ModEmail, assessmentInfo.TotalMark, assessmentInfo.NumSubmissionsMarked, assessmentInfo.TotalNumSubmissions)
        .then(results => {
            if (results) {
                res.status(200).json({ message: 'Assessment edited successfully'});
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

/**
 * Route to get all assessments for a marker.
 * GET /assessments
 * @query {string} MarkerEmail - Email of the marker.
 * @response {json} 200 - List of assessments.
 * @response {json} 404 - If no assessments are found.
 * @response {json} 500 - On server error.
 */
router.get('/assessments', (req, res) => {
    const MarkerEmail = req.query.MarkerEmail;
    clients.getAssessments(MarkerEmail)
        .then(assessments => {
            if (assessments) {
                res.status(200).json(assessments);
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

    /**
     * Route to get all assessments.
     * @returns {json} 200 - List of all assessments.
     * @returns {json} 404 - If no assessments are found.
     * @returns {json} 500 - On server error.
     */
router.get('/allAssessments', (req, res) => {
    clients.getAllAssessments()
        .then(assessments => {
            if (assessments) {
                res.status(200).json(assessments);
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

router.delete('/deleteAssessment', (req, res) => {
    const { AssessmentID } = req.query;
    console.log(AssessmentID);
    clients.deleteAssessment(AssessmentID)
        .then(result => {
            if (result) {
                res.status(200).json({ message: 'Assessment deleted successfully' });
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

router.get('/assessmentInfo', (req, res) => {
    const { AssessmentID } = req.query;
    clients.getAssessmentInfo(AssessmentID)
        .then(assessmentInfo => {
            if (assessmentInfo) {
                res.status(200).json(assessmentInfo);
            } else {
                res.status(404).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });
module.exports = {router,setClients};