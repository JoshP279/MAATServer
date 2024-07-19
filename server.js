const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
const assessmentRoutes = require('./routes/assessmentRoutes');
const markerRoutes = require('./routes/markerRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const port = 3306;
const ClientThreads = require('./ClientThreads');

const pool = mysql.createPool({
    host: 'postsql.mandela.ac.za',
    user: 'maatdb_user',
    password: 'hbaQAvfd2H$',
    database: 'MAATDB',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
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
app.get('/modules', assessmentRoutes.router);
app.get('/lecturers', assessmentRoutes.router);
app.get('/moderators', assessmentRoutes.router);
app.get('/markers', assessmentRoutes.router);
app.get('/assessments', assessmentRoutes.router);
app.get('/memoPDF', assessmentRoutes.router);   
app.put('/addAssessment', assessmentRoutes.router);

//All calls that retrieve or place data in the submission table
app.get('/submissionPDF', submissionRoutes.router);
app.get('/submissions', submissionRoutes.router);
app.put('/updateSubmissionStatus', submissionRoutes.router);
app.put('/uploadMarkedSubmission', submissionRoutes.router);
app.put('/addSubmission', submissionRoutes.router)

//All calls that retrieve or place data in the Marker table
app.get('/login', markerRoutes.router);