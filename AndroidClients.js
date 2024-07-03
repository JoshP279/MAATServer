const axios = require('axios')
class AndroidClients {
    constructor(pool){
        this.pool = pool;
    }
    async login(MarkerEmail, Password) {
        const query = `SELECT * FROM marker WHERE MarkerEmail = ? AND Password = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve({});
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