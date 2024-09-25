const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { file } = require('jszip');
const { Console } = require('console');
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
function updateAssessment(submissionID) {
    const updateAssessmentQuery = `
    UPDATE assessment a
    INNER JOIN submission s ON a.AssessmentID = s.AssessmentID
    SET 
        TotalNumSubmissions = (
            SELECT COUNT(*) FROM submission WHERE AssessmentID = s.AssessmentID
        ),
        NumSubmissionsMarked = (
            SELECT COUNT(*) FROM submission WHERE AssessmentID = s.AssessmentID AND SubmissionStatus = 'Marked'
        )
    WHERE s.SubmissionID = ?`;

    return new Promise((resolve, reject) => {
        pool.query(updateAssessmentQuery, [submissionID], (error, results) => {
            if (error) {
                console.error('Error updating assessment:', error);
                reject(error);
            } else {
                resolve(true);
            }
        });
    });
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
router.put('/updateSubmissionStatus', async (req, res) => {
    let { submissionID, submissionStatus } = req.body;
    if (!submissionID || !submissionStatus) {
        submissionID = req.query.submissionID;
        submissionStatus = req.query.submissionStatus;
    }

    const updateSubmissionQuery = 'UPDATE submission SET SubmissionStatus = ? WHERE SubmissionID = ?';

    pool.query(updateSubmissionQuery, [submissionStatus, submissionID], (error, results) => {
        if (error) {
            console.log('Failed to update submission status:', error);
            return res.status(500).json({ error: 'Failed to update submission status' });
        }

        if (results.affectedRows === 0) {
            console.log('Submission not found');
            return res.status(404).json({ error: 'Submission not found' });
        }

        if (submissionStatus === 'Marked' || submissionStatus === 'Unmarked') {
            updateAssessment(submissionID).then(assessmentUpdated => {
                if (assessmentUpdated) {
                    return res.status(200).json({ message: 'Submission status and assessment counts updated successfully' });
                } else {
                    console.log('Failed to update assessment counts');
                    return res.status(500).json({ error: 'Failed to update assessment counts' });
                }
            }).catch(error => {
                console.log('Failed to update assessment:', error);
                return res.status(500).json({ error: 'Failed to update assessment counts' });
            });
        } else {
            return res.status(200).json({ message: 'Submission status updated successfully' });
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
    const { submissionID, totalMarks, markingStyle } = req.body;
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfBuffer = req.file.buffer;
    const filePath = path.join(uploadsDir, `submission_${submissionID}.pdf`);

    fs.writeFile(filePath, pdfBuffer, (err) => {
        if (err) {
            console.log('Failed to save PDF:', err);
            return res.status(500).json({ error: 'Failed to save PDF' });
        }
        const queryUpdatePDF = 'UPDATE submission SET MarkedSubmissionPDF = ? WHERE SubmissionID = ?';
        pool.query(queryUpdatePDF, [pdfBuffer, submissionID], (error, results) => {
            if (error) {
                console.log('Database query error:', error);
                return res.status(500).json({ error: 'Failed to upload PDF to database' });
            } else {
                // const scriptPath = "C:\\MarkingSymbolRecognition\\main.py"; honours lab pc
                const scriptPath = "C:\\Users\\Joshua\\MarkingSymbolRecognition\\main.py"
                const pythonProcess = spawn('python', [scriptPath, filePath, submissionID, totalMarks, markingStyle]);

                pythonProcess.stdout.on('data', (data) => {
                    console.log(`Script output: ${data}`);
                });

                pythonProcess.stderr.on('data', (data) => {
                    console.error(`Script error: ${data}`);
                });

                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('Script executed successfully.');
                    } else {
                        console.error(`Script exited with code ${code}`);
                    }
                });

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
    clients.addSubmission(submissionInfo.AssessmentID, submissionBuffer,submissionInfo.StudentNum, submissionInfo.StudentName, submissionInfo.StudentSurname,submissionInfo.SubmissionStatus, submissionInfo.SubmissionFolderName)
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
 * Route to update a submission, specificall the name, surnaame and mark
 * PUT /updateSubmission
 * @param {Int} submissionID - ID of the submission
 * @response {json} 200 - Message if successful
 * @response {json} 404 - Error message if unsuccessful
 * @response {json} 500 - Error message if server error
 */
router.put('/updateSubmission', (req, res) => {
    const submissionID = req.body.SubmissionID;
    const submissionName = req.body.StudentName;
    const submissionSurname = req.body.StudentSurname;
    const submissionMark = req.body.SubmissionMark;
    clients.updateSubmission(submissionID, submissionName, submissionSurname, submissionMark)
        .then(results => {
            if (results) {
                res.status(200).json({ message: 'Submission updated successfully'});
            } else {
                res.status(404).json({ error: 'Failed to update submission' });
            }
        }
        )
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Server Error' });
        });
    });

/**
 * Route to edit a submission, used when updating assessments to by auto parsing the zip file
 * PUT /editSubmission
 * @param {form} submissionInfo - Updated submission information
 * @response {json} 200 - Message if successful
 * @response {json} 404 - Error message if failed to edit submission
 * @response {json} 500 - Error message if server error
 */
router.put('/editSubmission', async (req, res) => {
    try {
        console.log('Editing submission');
        const submissionInfo = req.body;
        const submissionObject = submissionInfo.SubmissionPDF;
        const submissionBuffer = Buffer.from(Object.values(submissionObject)); // Ensure object is formatted correctly

        // Attempt to edit the submission
        const results = await clients.editSubmission(
            submissionInfo.SubmissionID,
            submissionBuffer,
            submissionInfo.StudentNum,
            submissionInfo.StudentName,
            submissionInfo.StudentSurname,
            submissionInfo.SubmissionStatus,
            submissionInfo.SubmissionFolderName
        );

        // If successful, update the assessment and send response
        if (results) {
            updateAssessment(submissionInfo.SubmissionID);
            res.status(200).json({ message: 'Submission edited successfully' });
        } else {
            res.status(404).json({ error: 'Failed to edit submission' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
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

router.put('/updateSubmissionMark', (req, res) => {
    const submissionID = req.body.submissionID;
    const totalMark = req.body.totalMark;
    clients.updateSubmissionMark(submissionID, totalMark)
        .then(() => {
            res.status(200).json({ message: 'Submission mark updated successfully' });
        })
        .catch(error => {
            console.error('Error updating submission mark:', error);
            res.status(500).json({ error: 'Server Error' });
        });
});

module.exports = { router, setClientsAndPool };