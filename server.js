const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const app = express();
const port = 3030;
const AndroidClients = require('./AndroidClients')
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
let androidClients;
function establishConnection() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to the database:', err);
        } else {
            console.log('Connected to the database successfully');
            androidClients = new AndroidClients(pool);
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
establishConnection()

app.get('/androidLogin', (req, res) => {
    const { MarkerEmail, Password } = req.query;
    androidClients.login(MarkerEmail, Password)
        .then(loginStatus => {
            if (loginStatus) {
                res.status(200).json({ message: 'Login successful'});
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
    const assessmentLecturer = req.query.AssessmentLecturer;
    if (!assessmentLecturer) {
        return res.status(400).json({ error: 'Assessment Lecturer is required' });
    }
    androidClients.getAssessments(assessmentLecturer)
        .then(assessments => {
            if (assessments) {
                res.status(201).json(assessments);
            } else {
                res.status(401).json({ error: 'No assessments found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(501).json({ error: 'Server Error' });
        });
});