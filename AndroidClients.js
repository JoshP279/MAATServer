const axios = require('axios')
class AndroidClients {
    constructor(pool){
        this.pool = pool;
    }
    async login(username, password) {
        const query = `SELECT * FROM tempusers WHERE userName = ? AND password = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [username, password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve({ username: results[0].username });
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async getAssessments(username) {
        const query = `SELECT ModuleCode, AssessmentName, AssessmentLecturer FROM assessment WHERE AssessmentLecturer = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [username], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    console.log([username]);
                    if (results.length > 0) {
                        const assessments = results.map(result => ({
                            moduleCode: result.ModuleCode,
                            assessmentName: result.AssessmentName,
                            assessmentLecturer: result.AssessmentLecturer
                        }));
                        resolve(assessments);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
}
module.exports = AndroidClients