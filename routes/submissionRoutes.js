const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const projectRoot = process.cwd();
const uploadsDir = path.join(projectRoot, 'uploads');
const storage = multer.memoryStorage();
const upload = multer({ storage });
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}
let clients;
let pool;

/**
 * Sets the clients object to the instance passed in
 * Sets the pool object to the instance passed in
 * @param {Object} clientInstance - instance of the ClientThreads
 * @param {Object} poolInstance - instance of the MySQL pool
 */
function setClientsAndPool(clientInstance, poolInstance) {
    clients = clientInstance;
    pool = poolInstance;
}

/**
 * Updates the assessment table with the total number of submissions and the number of submissions marked
 * Note that the efficient and recommended method of doing this is creating a trigger in the database, 
 * but I do not have the necessary permissions to do so.
 * @param {Int} submissionID  - ID of the submission
 * @returns true if the query was successful, false otherwise
 */
function updateAssessment(submissionID){
    const updateAssessmentQuery = `
    UPDATE assessment
    SET TotalNumSubmissions = (
        SELECT COUNT(*) FROM submission WHERE AssessmentID = (
            SELECT AssessmentID FROM submission WHERE SubmissionID = ?
        )
    ),
    NumSubmissionsMarked = (
        SELECT COUNT(*) FROM submission WHERE AssessmentID = (
            SELECT AssessmentID FROM submission WHERE SubmissionID = ?
        ) AND SubmissionStatus = 'Marked'
    )
    WHERE AssessmentID = (
        SELECT AssessmentID FROM submission WHERE SubmissionID = ?
    )`;
    pool.query(updateAssessmentQuery, [submissionID, submissionID, submissionID], (error) => {
        if (error) {
            return false;
        }
        return true;
    });
    return true;
}

/**
 * Route to update submission status
 * PUT /updateSubmissionStatus
 * @param {Int} submissionID - ID of the submission
 * @param {String} submissionStatus - New status of the submission
 * @response {json} 200 - Message if successful
 * @response {json} 500 - Error message if server error
 * @response {json} 500 - Error message if database error 
 * The submission status is updated in the database
 */
router.put('/updateSubmissionStatus', (req, res) => {
    let { submissionID, submissionStatus } = req.body;
    if (!submissionID || !submissionStatus) {
        submissionID = req.query.submissionID;
        submissionStatus = req.query.submissionStatus;
    }
    const updateSubmissionQuery = 'UPDATE submission SET SubmissionStatus = ? WHERE SubmissionID = ?';
    pool.query(updateSubmissionQuery, [submissionStatus, submissionID], (error, results) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to update submission status' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (updateAssessment(submissionID)) {
            res.status(200).json({ message: 'Submission status updated and assessment counts updated successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to update assessment status' });
        }
    });
});

/**
 * Route to get all submissions
 * GET /submissions
 * @param {Int} assessmentID - ID of the assessment
 * @response {json} 200 - Submissions if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 * Submissions are returned as an array of objects
 */
router.get('/submissions', (req, res) => {
    const assessmentID = req.query.AssessmentID;
    clients.getSubmissions(assessmentID)
        .then(submissions => {
            if (submissions) {
                res.status(200).json(submissions);
            } else {
                res.status(404).json({ error: 'No submissions found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to upload a marked submission
 * PUT /uploadMarkedSubmission
 * @param {Int} submissionID - ID of the submission
 * @param {File} pdfFile - PDF file of the marked submission
 * @response {json} 200 - Message if successful
 * @response {json} 400 - Error message if no file uploaded
 * @response {json} 500 - Error message if failed to save PDF
 * The PDF file is saved to the uploads directory as well as upload to the database
 * Note that a database limitation is a max packet size of 16 MB, meaning that the PDF file should be less than 16 MB
 */
router.put('/uploadMarkedSubmission', upload.single('pdfFile'), (req, res) => {
    const { submissionID } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const pdfBuffer = req.file.buffer;
    const filePath = path.join(uploadsDir, `submission_${submissionID}.pdf`);
    fs.writeFile(filePath, pdfBuffer, (err) => {
        if (err) {
            console.error('Failed to save PDF:', err);
            return res.status(500).json({ error: 'Failed to save PDF' });
        }
        const query = 'UPDATE submission SET MarkedSubmissionPDF = ? WHERE SubmissionID = ?';
        pool.query(query, [pdfBuffer, submissionID], (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                return res.status(500).json({ error: 'Failed to upload PDF to database' });
            } else {
                return res.status(200).json({
                    message: 'File uploaded and database updated successfully',
                    submissionID,
                    filePath
                });
            }
        });
    });
});

/**
 * Route to get a submission PDF
 * GET /submissionPDF
 * @param {Int} submissionID - ID of the submission
 * @response {json} 200 - Submission PDF if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 * pdfData is sent as a binary stream
 */
router.get('/submissionPDF', (req, res) => {
    const submissionID = req.query.SubmissionID;
    clients.getSubmissionPDF(submissionID)
        .then(pdfData => {
            if (pdfData) {
                res.status(200).json({ pdfData });
            } else {
                res.status(404).json({ error: 'Submission PDF not found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to add a submission
 * PUT /addSubmission
 * @param {form} submissionInfo - Submission information
 * @response {json} 200 - Message if successful
 * @response {json} 404 - Error message if failed to add submission
 * @response {json} 500 - Error message if server error
 * The submission is added to the database
 */
router.put('/addSubmission', (req, res) => {
    const submissionInfo = req.body;
    const submissionObject = submissionInfo.SubmissionPDF;
    const submissionBuffer = Buffer.from(Object.values(submissionObject));
    clients.addSubmission(submissionInfo.AssessmentID, submissionBuffer,submissionInfo.StudentNum, submissionInfo.StudentName, submissionInfo.StudentSurname,submissionInfo.SubmissionStatus)
        .then(resultId => {
            if (resultId) {
                updateAssessment(resultId);
                res.status(200).json({ message: 'Submission added successfully'});
            } else {
                res.status(404).json({ error: 'Failed to add submission' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
});

/**
 * Route to get a marked submission PDF
 * GET /markedSubmission
 * @param {Int} submissionID - ID of the submission
 * @response {json} 200 - Marked submission PDF if found
 * @response {json} 404 - Error message if not found
 * @response {json} 500 - Error message if server error
 * MarkedSubmission is sent as a binary stream
 */
router.get('/markedSubmission', (req, res) => {
    const submissionID = req.query.SubmissionID;
    clients.getMarkedSubmission(submissionID)
    .then(pdfData => {
        if (pdfData) {
            res.status(200).json({ pdfData });
        } else {
            res.status(404).json({ error: 'Submission PDF not found' });
        }
    })
    .catch(error => {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    });
});

module.exports = { router, setClientsAndPool };