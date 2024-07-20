const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer'); // Corrected typo here
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
const assessmentRoutes = require('./routes/assessmentRoutes');
const markerRoutes = require('./routes/markerRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const ClientThreads = require('./ClientThreads');

const port = 3306; // Changed port to 3000 for the Express server

const pool = mysql.createPool({
    host: 'postsql.mandela.ac.za',
    user: 'maatdb_user',
    password: 'hbaQAvfd2H$',
    database: 'MAATDB',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'joshuapage27@gmail.com',
        pass: 'vqsz urle arew cdkv'
    }
});

let clients;
function establishConnection() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the database successfully');
            clients = new ClientThreads(pool);
            markerRoutes.setClients(clients);
            assessmentRoutes.setClients(clients);
            submissionRoutes.setClientsAndPool(clients, pool);
            moduleRoutes.setClients(clients);
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

app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

//All calls that retrieve or place data in the assessment table

app.get('/lecturers', assessmentRoutes.router);
app.get('/moderators', assessmentRoutes.router);
app.get('/markers', assessmentRoutes.router);
app.get('/assessments', assessmentRoutes.router);
app.get('/memoPDF', assessmentRoutes.router);   
app.put('/addAssessment', assessmentRoutes.router);
app.put('/editAssessment', assessmentRoutes.router);

//All calls that retrieve or place data in the submission table
app.get('/submissionPDF', submissionRoutes.router);
app.get('/submissions', submissionRoutes.router);
app.put('/updateSubmissionStatus', submissionRoutes.router);
app.put('/uploadMarkedSubmission', submissionRoutes.router);
app.put('/addSubmission', submissionRoutes.router);

app.get('/markedSubmission', submissionRoutes.router);

//All calls that retrieve or place data in the Marker table
app.get('/login', markerRoutes.router);
//All calls that retrieve or place data in the Module table
app.get('/modules', moduleRoutes.router);

//send emails
app.post('/sendEmail', (req, res) => {
    const { to, subject, text, pdfData } = req.body;
    const mailOptions = {
        from: 'joshuapage27@gmail.com',
        to,
        subject,
        text,
        attachments: [
            {
                filename: 'marked_submission.pdf',
                content: Buffer.from(pdfData.data),
                contentType: 'application/pdf'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send(error.toString());
        }
        res.status(200).json({ message: 'Email sent successfully' });
    });
});
