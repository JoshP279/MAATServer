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

function setClientsAndPool(clientInstance, poolInstance) {
    clients = clientInstance;
    pool = poolInstance;
}
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
router.put('/updateSubmissionStatus', (req, res) => {
    let { submissionID, submissionStatus } = req.body;
    if (!submissionID || !submissionStatus) {
        submissionID = req.query.submissionID;
        submissionStatus = req.query.submissionStatus;
    }
    const updateSubmissionQuery = 'UPDATE submission SET SubmissionStatus = ? WHERE SubmissionID = ?';
    pool.query(updateSubmissionQuery, [submissionStatus, submissionID], (error) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to update submission status' });
        }
       if (updateAssessment(submissionID)){
        res.status(200).json({ message: 'Submission status updated and assessment counts updated successfully' });
       } else{
        return res.status(500).json({ error: 'Failed to update assessment status' });
       }
    });
});

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