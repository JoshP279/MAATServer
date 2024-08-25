// Importing required modules
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');
const os = require('os');

// Initialise multer for file uploads
const upload = multer();

// Initialise the express application
const app = express();
const port = 3306;

// Middleware setup
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

// Importing the routes
const assessmentRoutes = require('./routes/assessmentRoutes');
const markerRoutes = require('./routes/markerRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const ClientThreads = require('./ClientThreads');

// Configuring MYSQL connection pool
const pool = mysql.createPool({
    host: 'postsql.mandela.ac.za',
    user: 'maatdb_user',
    password: 'hbaQAvfd2H$',
    database: 'MAATDB',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
});

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: 'joshuapage27@gmail.com',
        pass: 'vqsz urle arew cdkv'
    }
});
/**
 * Obtain the IP address of Server
 * @returns the local IP address of the server
 */
function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const iface of interfaceInfo) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';  // Default to localhost if no IP address is found
}


let clients;
/**
 * Establish connection to the database and initialise client threads
 */
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

    // Start the server
    app.listen(port, '0.0.0.0', () => {
        const localIp = getLocalIpAddress(); // Get the local IP address
        console.log(`Server running on http://${localIp}:${port}`);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
        console.error('There was an uncaught error', err);
    });
}

establishConnection();

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Route definitions for assessment operations
app.get('/assessments', assessmentRoutes.router);
app.get('/allAssessments', assessmentRoutes.router);
app.get('/memoPDF', assessmentRoutes.router);   
app.put('/addAssessment', assessmentRoutes.router);
app.put('/editAssessment', assessmentRoutes.router);
app.delete('/deleteAssessment', assessmentRoutes.router);
app.get('/assessmentInfo', assessmentRoutes.router);

// Route definitions for submission operations
app.get('/submissionPDF', submissionRoutes.router);
app.get('/submissions', submissionRoutes.router);
app.put('/updateSubmissionStatus', submissionRoutes.router);
app.put('/uploadMarkedSubmission', submissionRoutes.router);
app.put('/addSubmission', submissionRoutes.router);
app.put('/updateSubmission', submissionRoutes.router);
app.get('/markedSubmission', submissionRoutes.router);
app.put('/updateSubmissionMark', submissionRoutes.router);

// Route definitions for marker operations
app.get('/login', markerRoutes.router);
app.get('/lecturers', markerRoutes.router);
app.get('/moderators', markerRoutes.router);
app.get('/markers', markerRoutes.router);
app.get('/demiMarkers', markerRoutes.router);
app.put('/editMarker', markerRoutes.router);
app.put('/addDemiMarker', markerRoutes.router);
app.put('/addLecturer', markerRoutes.router);
app.delete('/deleteMarker', markerRoutes.router);
app.put('/editLecturer', markerRoutes.router);

// Route definitions for module operations
app.get('/modules', moduleRoutes.router);
app.put('/addModule', moduleRoutes.router);
app.delete('/deleteModule', moduleRoutes.router);
app.put('/editModule', moduleRoutes.router);

// Route for sending emails to students
app.post('/sendStudentEmail', (req, res) => {
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
            res.status(500).send({message: 'Failed to send email', error:error});
        }
        res.status(200).json({ message: 'Email sent successfully' });
    });
});

// Route for sending emails to moderators with CSV attachment
app.post('/sendModeratorEmail', upload.single('csv'), (req, res) => {
    const { to, subject, text } = req.body;
    const csvBuffer = req.file.buffer;
    const mailOptions = {
        from: 'joshuapage27@gmail.com',
        to,
        subject,
        text,
        attachments: [
            {
                filename: 'assessment_results.csv',
                content: csvBuffer,
                contentType: 'application/csv'
            }
        ]
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.status(500).send({message: 'Failed to send email', error:error});
        }
        res.status(200).json({ message: 'Email sent successfully' });
    });
});