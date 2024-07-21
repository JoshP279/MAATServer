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
            const query = `SELECT AssessmentID,ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions FROM assessment WHERE MarkerEmail = ? OR LecturerEmail = ?`;
            return new Promise((resolve, reject) => {
                this.pool.query(query, [MarkerEmail,MarkerEmail], (error, results) => {
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
            const query = 'SELECT AssessmentID, SubmissionID,StudentNum, SubmissionMark,StudentName, StudentSurname, SubmissionStatus FROM submission WHERE AssessmentID = ?';
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
                            submissionMark: result.SubmissionMark,
                            studentName: result.StudentName,
                            studentSurname: result.StudentSurname,
                            submissionStatus: result.SubmissionStatus,
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
        const query = 'SELECT ModuleName, ModuleCode FROM module';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const modules = results.map(result => ({ ModuleCode: result.ModuleCode, ModuleName: result.ModuleName }));
                        resolve(modules);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    async getLecturers(){
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker WHERE  MarkerRole <> "Demi"';
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
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker WHERE MarkerRole <> "Demi"';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const moderators = results.map(result => ({ ModEmail: result.MarkerEmail}));
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
    async addAssessment(LecturerEmail, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions){
        const query = 'INSERT INTO assessment (LecturerEmail, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions) VALUES (?,?,?,?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [LecturerEmail,MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }
    async editAssessment(AssessmentID, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions){
        const query = `UPDATE assessment 
                       SET MarkerEmail = ?, 
                           AssessmentName = ?, 
                           ModuleCode = ?, 
                           Memorandum = ?, 
                           ModEmail = ?, 
                           TotalMark = ?, 
                           NumSubmissionsMarked = ?, 
                           TotalNumSubmissions = ? 
                       WHERE AssessmentID = ?`;
    
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
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
    async getMarkedSubmission(submissionID) {
        const query = 'SELECT MarkedSubmissionPDF FROM submission WHERE SubmissionID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [submissionID], (error, results) => {
                if (error) {
                    console.log('dfa');
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0].MarkedSubmissionPDF);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
}
module.exports = ClientThreads