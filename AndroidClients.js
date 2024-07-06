    const axios = require('axios');
    const { query } = require('express');
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
            const query = `SELECT AssessmentID,ModuleCode, AssessmentName, AssessmentLecturer, NumSubmissionsMarked, TotalNumSubmissions FROM assessment WHERE AssessmentLecturer = ?`;
            return new Promise((resolve, reject) => {
                this.pool.query(query, [username], (error, results) => {
                    if (error) {
                        reject(error);
                    } else {
                        if (results.length > 0) {
                            const assessments = results.map(result => ({
                                assessmentID: result.AssessmentID,
                                moduleCode: result.ModuleCode,
                                assessmentName: result.AssessmentName,
                                assessmentLecturer: result.AssessmentLecturer,
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
            const query = 'SELECT SubmissionID,StudentNum, StudentName, StudentSurname, SubmissionStatus FROM submission WHERE AssessmentID = ?';
            return new Promise((resolve, reject) => {
                this.pool.query(query,[AssessmentID], (error,results) => {
                if (error){
                    reject(error);
                }else{
                    if (results.length > 0){
                        const submissions = results.map(result => ({
                            submissionID: result.SubmissionID,
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
}
module.exports = AndroidClients