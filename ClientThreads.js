/**
 * ClientThreads class for handling database operations related to assessments, submissions, and users.
 */
class ClientThreads {
    /**
     * Creates an instance of ClientThreads.
     * @param {Object} pool - The MySQL connection pool.
     */

    constructor(pool){
        this.pool = pool;
    }

    /**
     * Logs in a marker by checking their email and password.
     * @param {String} MarkerEmail - The email of the marker.
     * @param {String} Password - The password of the marker.
     * @returns {Promise<String|null>} - The role of the marker if login is successful, otherwise null.
     */
    async login(MarkerEmail, Password) {
        const query = `SELECT MarkerRole FROM marker WHERE MarkerEmail = ? AND Password = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0].MarkerRole);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    /**
     * Retrieves the assessments for a given marker.
     * @param {String} MarkerEmail - The email of the marker.
     * @returns {Promise<Object[]|null>} - A list of assessments or null if none are found.
     */
    async getAssessments(MarkerEmail) {
        const query = `SELECT AssessmentID,ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions, ModEmail FROM assessment WHERE MarkerEmail = ? OR LecturerEmail = ?`;
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
                            totalSubmissions: result.TotalNumSubmissions,
                            modEmail: result.ModEmail
                        }));
                        resolve(assessments);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }

    /**
     * Retrieves the submissions for a given assessment.
     * @param {Int} AssessmentID - The ID of the assessment.
     * @returns {Promise<Object[]|null>} - A list of submissions or null if none are found.
     */
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
            }});
        })
    }

    /**
     * Retrieves the PDF for a given submission.
     * @param {Int} submissionID - The ID of the submission.
     * @returns {Promise<Buffer|null>} - The PDF data as a buffer or null if not found.
     */
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

    /**
     * Retrieves the memorandum PDF for a given assessment.
     * @param {Int} assessmentID - The ID of the assessment.
     * @returns {Promise<Buffer|null>} - The memorandum PDF data as a buffer or null if not found.
     */
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

    /**
     * Retrieves all modules.
     * @returns {Promise<Object[]|null>} - A list of modules or null if none are found.
     */
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

    /**
     * Retrieves all lecturers.
     * @returns {Promise<Object[]|null>} - A list of lecturers or null if none are found.
     */
    async getLecturers(){
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker WHERE MarkerRole <> "Demi"';
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

    /**
     * Retrieves all moderators.
     * @returns {Promise<Object[]|null>} - A list of moderators or null if none are found.
     */
    async getModerators(){
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker WHERE MarkerRole <> "Demi" AND MarkerRole <> "Admin"';
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

    /**
     * Retrieves all markers.
     * @returns {Promise<Object[]|null>} - A list of markers or null if none are found.
     */
    async getMarkers(){
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname FROM marker WHERE MarkerRole <> "Admin"';
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

    /**
     * Adds a new assessment to the database.
     * @param {String} LecturerEmail - The email of the lecturer.
     * @param {String} MarkerEmail - The email of the marker.
     * @param {String} AssessmentName - The name of the assessment.
     * @param {String} ModuleCode - The module code.
     * @param {Buffer} Memorandum - The memorandum PDF data as a buffer.
     * @param {String} ModEmail - The email of the moderator.
     * @param {Int} TotalMark - The total mark for the assessment.
     * @param {Int} NumSubmissionsMarked - The number of submissions marked.
     * @param {Int} TotalNumSubmissions - The total number of submissions.
     * @returns {Promise<Int>} - The ID of the newly added assessment.
     */
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

    /**
     * Edits an existing assessment in the database.
     * @param {Int} AssessmentID - The ID of the assessment.
     * @param {String} MarkerEmail - The email of the marker.
     * @param {String} AssessmentName - The name of the assessment.
     * @param {String} ModuleCode - The module code.
     * @param {Buffer} Memorandum - The memorandum PDF data as a buffer.
     * @param {String} ModEmail - The email of the moderator.
     * @param {Int} TotalMark - The total mark for the assessment.
     * @param {Int} NumSubmissionsMarked - The number of submissions marked.
     * @param {Int} TotalNumSubmissions - The total number of submissions.
     * @returns {Promise<Object>} - The result of the update operation.
     */
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
    
    /**
     * Adds a new submission to the database.
     * @param {Int} AssessmentID - The ID of the assessment.
     * @param {Buffer} SubmissionPDF - The submission PDF data as a buffer.
     * @param {String} StudentNum - The student number.
     * @param {String} StudentName - The student's first name.
     * @param {String} StudentSurname - The student's last name.
     * @param {String} SubmissionStatus - The status of the submission.
     * @returns {Promise<Int>} - The ID of the newly added submission.
     */
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

    /**
     * Retrieves the marked submission PDF for a given submission.
     * @param {Int} submissionID - The ID of the submission.
     * @returns {Promise<Buffer|null>} - The marked submission PDF data as a buffer or null if not found.
     */
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