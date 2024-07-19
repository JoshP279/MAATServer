    class ClientThreads {
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

        async getAssessments(MarkerEmail) {
            const query = `SELECT AssessmentID,ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions FROM assessment WHERE MarkerEmail = ?`;
            return new Promise((resolve, reject) => {
                this.pool.query(query, [MarkerEmail], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (results.length > 0) {
                            const assessments = results.map(result => ({
                                assessmentID: result.AssessmentID,
                                moduleCode: result.ModuleCode,
                                assessmentName: result.AssessmentName,
                                numMarked: result.NumSubmissionsMarked,
                                totalSubmissions: result.TotalNumSubmissions
                            }));
                            resolve(assessments);
                        } else {
                            resolve(null);
                        }
                    }
                });
            });
        }

        async getSubmissions(AssessmentID){
            const query = 'SELECT AssessmentID, SubmissionID,StudentNum, StudentName, StudentSurname, SubmissionStatus FROM submission WHERE AssessmentID = ?';
            return new Promise((resolve, reject) => {
                this.pool.query(query,[AssessmentID], (error,results) => {
                if (error){
                    reject(error);
                }else{
                    if (results.length > 0){
                        const submissions = results.map(result => ({
                            submissionID: result.SubmissionID,
                            assessmentID: result.AssessmentID,
                            studentNumber: result.StudentNum,
                            studentName: result.StudentName,
                            studentSurname: result.StudentSurname,
                            submissionStatus: result.SubmissionStatus
                        }));
                        resolve(submissions);
                    }else{
                        resolve(null);
                    }
                }
            });
        });
    }

    async getSubmissionPDF(submissionID) {
        const query = 'SELECT SubmissionPDF FROM submission WHERE SubmissionID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [submissionID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0].SubmissionPDF);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    async getMemoPDF(assessmentID) {
        const query = 'SELECT Memorandum FROM assessment WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [assessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0].Memorandum);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    async getModules(){
        const query = 'SELECT DISTINCT ModuleCode FROM assessment';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const modules = results.map(result => ({ ModuleCode: result.ModuleCode}));
                        resolve(modules);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    async getLecturers(){
        const query = 'SELECT DISTINCT MarkerEmail FROM assessment';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const modules = results.map(result => ({ MarkerEmail: result.MarkerEmail}));
                        resolve(modules);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    async getModerators(){
        const query = 'SELECT DISTINCT ModEmail FROM assessment';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const moderators = results.map(result => ({ ModEmail: result.ModEmail}));
                        resolve(moderators);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    
    async getMarkers(){
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const markers = results.map(result => ({
                            MarkerEmail: result.MarkerEmail,
                            Name: result.Name,
                            Surname: result.Surname
                        }));
                        resolve(markers);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    async addAssessment(MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions){
        const query = 'INSERT INTO assessment (MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions) VALUES (?,?,?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }
    async addSubmission(AssessmentID, SubmissionPDF,StudentNum, StudentName, StudentSurname, SubmissionStatus){
        const query = 'INSERT INTO submission (AssessmentID, SubmissionPDF, StudentNum, StudentName, StudentSurname, SubmissionStatus) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID, SubmissionPDF,StudentNum, StudentName, StudentSurname, SubmissionStatus], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }
}
module.exports = ClientThreads