const express = require('express');
const router = express.Router();

let clients;
function setClients(clientInstance) {
    clients = clientInstance;
}
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
router.put('/addAssessment', (req, res) => {
    const assessmentInfo = req.body;
    const memoObject = assessmentInfo.Memorandum;
    const memoBuffer = Buffer.from(Object.values(memoObject));
    clients.addAssessment(assessmentInfo.LecturerEmail, assessmentInfo.MarkerEmail, assessmentInfo.AssessmentName, assessmentInfo.ModuleCode, memoBuffer, assessmentInfo.ModEmail, assessmentInfo.TotalMark, assessmentInfo.NumSubmissionsMarked, assessmentInfo.TotalNumSubmissions)
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
router.put('/editAssessment', (req, res) => {
    const assessmentInfo = req.body;
    const memoObject = assessmentInfo.Memorandum;
    const memoBuffer = Buffer.from(Object.values(memoObject));
    clients.editAssessment(assessmentInfo.AssessmentID, assessmentInfo.MarkerEmail, assessmentInfo.AssessmentName, assessmentInfo.ModuleCode, memoBuffer, assessmentInfo.ModEmail, assessmentInfo.TotalMark, assessmentInfo.NumSubmissionsMarked, assessmentInfo.TotalNumSubmissions)
        .then(resultId => {
            if (resultId) {
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
    