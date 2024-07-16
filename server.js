const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const app = express();
const port = 3306;
const WebClients = require('./WebClients')
const AndroidClients = require('./AndroidClients');
app.use(cors());
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: 'postsql.mandela.ac.za',
    user: 'maatdb_user',
    password: 'hbaQAvfd2H$',
    database: 'MAATDB',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const uploadsDir = path.join(__dirname, 'uploads');
const storage = multer.memoryStorage();
const upload = multer({ storage });
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

let webClients;
let androidClients;
function establishConnection() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the database successfully');
            androidClients = new AndroidClients(pool);
            webClients = new WebClients(pool);
            connection.release();
        }
    });
    app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on postsql.mandela.ac.za:${port}`);
    });

    process.on('uncaughtException', (err) => {
        console.error('There was an uncaught error', err);
    });
}

establishConnection();
app.post('/webLogin', (req, res) => {
    const { MarkerEmail, Password } = req.body;
    webClients.login(MarkerEmail, Password)
    .then(loginStatus => {
        console.log(loginStatus);
        if (loginStatus) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(400).json({ error: 'Invalid username or password' });
        }
    })
    .catch(error => {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Server error' });
    });
});

app.get('/androidLogin', (req, res) => {
    const { MarkerEmail, Password } = req.query;
    androidClients.login(MarkerEmail, Password)
        .then(loginStatus => {
            if (loginStatus) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                res.status(400).json({ error: 'Invalid username or password' });
            }
        })
        .catch(error => {
            console.error('Error logging in:', error);
            res.status(500).json({ error: 'Server error' });
        });
});

app.get('/assessments', (req, res) => {
    const MarkerEmail = req.query.MarkerEmail;
    androidClients.getAssessments(MarkerEmail)
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

app.get('/submissions', (req, res) => {
    const assessmentID = req.query.AssessmentID;
    androidClients.getSubmissions(assessmentID)
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

app.put('/updateSubmission', (req, res) => {
    const { submissionID, submissionStatus } = req.body;
    const query = 'UPDATE submission SET SubmissionStatus = ? WHERE SubmissionID = ?';
    pool.query(query, [submissionStatus, submissionID], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Failed to update submission status' });
        } else {
            res.status(200).json({ message: 'Submission status updated successfully' });
        }
    });
});

app.put('/uploadSubmission', upload.single('pdfFile'), (req, res) => {
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


app.get('/submissionPDF', (req, res) => {
    const submissionID = req.query.SubmissionID;
    androidClients.getSubmissionPDF(submissionID)
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

app.get('/memoPDF', (req, res) => {
    const assessmentID = req.query.AssessmentID;
    androidClients.getMemoPDF(assessmentID)
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