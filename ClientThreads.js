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
        const query = `
            SELECT AssessmentID, ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions, ModEmail, AssessmentType 
            FROM assessment 
            WHERE 
                MarkerEmail LIKE CONCAT('%"', ?, '"%')
            OR LecturerEmail = ?`;
        
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, MarkerEmail], (error, results) => {
                if (error) {
                    console.error('SQL Error:', error);
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const assessments = results.map(result => ({
                            assessmentID: result.AssessmentID,
                            moduleCode: result.ModuleCode,
                            assessmentName: result.AssessmentName,
                            numMarked: result.NumSubmissionsMarked,
                            totalSubmissions: result.TotalNumSubmissions,
                            modEmail: result.ModEmail,
                            assessmentType: result.AssessmentType
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
     * Gets all assessments in the database.
     * Used by the admin
     * @returns {Promise<Object[]|null>} - A list of assessments or null if none are found.
     */
    async getAllAssessments() {
        const query = `
            SELECT AssessmentID, ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions, ModEmail 
            FROM assessment`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    console.error('SQL Error:', error);
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
        const query = 'SELECT AssessmentID, SubmissionID,StudentNum, SubmissionMark,StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName FROM submission WHERE AssessmentID = ?';
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
                        submissionFolderName: result.SubmissionFolderName
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
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname, Password FROM marker WHERE MarkerRole <> "Demi" AND MarkerRole <> "Admin"';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const modules = results.map(result => ({ 
                            MarkerEmail: result.MarkerEmail,
                            Name: result.Name,
                            Surname: result.Surname,
                            Password: result.Password
                        }));
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
                        const moderators = results.map(result => (
                            { ModEmail: result.MarkerEmail,
                                Name: result.Name,
                                Surname: result.Surname
                            }
                        ));
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
     * Retrieves all demi markers.
     * @returns {Promise<Object[]|null>} - A list of demi markers or null if none are found.
     */
    async getDemiMarkers(){ 
        const query = 'SELECT DISTINCT MarkerEmail, Name, Surname, Password FROM marker WHERE MarkerRole = "Demi"';
        return new Promise((resolve, reject) => {
            this.pool.query(query, (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const markers = results.map(result => ({
                            MarkerEmail: result.MarkerEmail,
                            Name: result.Name,
                            Surname: result.Surname,
                            Password: result.Password
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
     * @param {Array<String>} MarkerEmails - The email of the marker.
     * @param {String} AssessmentName - The name of the assessment.
     * @param {String} ModuleCode - The module code.
     * @param {Buffer} Memorandum - The memorandum PDF data as a buffer.
     * @param {String} ModEmail - The emails of the moderators (can be a list).
     * @param {Int} TotalMark - The total mark for the assessment.
     * @param {Int} NumSubmissionsMarked - The number of submissions marked.
     * @param {Int} TotalNumSubmissions - The total number of submissions.
     * @returns {Promise<Int>} - The ID of the newly added assessment.
     */
    async addAssessment(LecturerEmail, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentType) {
        const markerEmailString = JSON.stringify(MarkerEmail);
        const query = `
            INSERT INTO assessment (
                LecturerEmail, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentType
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [LecturerEmail,markerEmailString , AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentType], (error, results) => {
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
        const markerEmailString = JSON.stringify(MarkerEmail);
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
            this.pool.query(query, [markerEmailString, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('assessment edited');
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
    async addSubmission(AssessmentID, SubmissionPDF,StudentNum, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName){
        const query = 'INSERT INTO submission (AssessmentID, SubmissionPDF, StudentNum, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName) VALUES (?,?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID, SubmissionPDF,StudentNum, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.insertId);
                }
            });
        });
    }

    /**
     * Edit a submission to the database.
     * @param {Int} AssessmentID - The ID of the assessment.
     * @param {Buffer} SubmissionPDF - The submission PDF data as a buffer.
     * @param {String} StudentNum - The student number.
     * @param {String} StudentName - The student's first name.
     * @param {String} StudentSurname - The student's last name.
     * @param {String} SubmissionStatus - The status of the submission.
     * @returns {Promise<Int>} - The ID of the newly added submission.
     */
    async editSubmission(AssessmentID, SubmissionPDF, StudentNum, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName) {
        const query = `
            UPDATE submission 
            SET 
                SubmissionPDF = ?, 
                StudentName = ?, 
                StudentSurname = ?, 
                SubmissionStatus = ?, 
                SubmissionFolderName = ?
            WHERE 
                AssessmentID = ? 
                AND StudentNum = ?;
        `;
        
        return new Promise((resolve, reject) => {
            this.pool.query(query, [SubmissionPDF, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName, AssessmentID, StudentNum], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
    async updateSubmission(SubmissionID, StudentNum, StudentSurname, SubmissionMark){{
        const query = 'UPDATE submission SET StudentName = ?, StudentSurname = ?, SubmissionMark = ? WHERE SubmissionID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [StudentNum, StudentSurname, SubmissionMark, SubmissionID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
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
    /**
     * Adds a new module to the database.
     * @param {String} ModuleCode 
     * @param {String} ModuleName 
     * @returns a success message if the module is added successfully
     */
    async addModule(ModuleCode, ModuleName){
        const query = 'INSERT INTO module (ModuleCode, ModuleName) VALUES (?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [ModuleCode, ModuleName], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Module added successfully'});
                }
            });
        });
    }
    /**
     * Deletes a module from the database.
     * @param {String} ModuleCode 
     * @returns a success message if the module is deleted successfully
     * @returns an error message if the module is not found (should never happen, as valid modules are only loaded)
     */
    async deleteModule(ModuleCode){
        const query = 'DELETE FROM module WHERE ModuleCode = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [ModuleCode], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Module deleted successfully'});
                }
            });
        });
    }
    /**
     * Edits a module name in the database.
     * @param {String} ModuleCode 
     * @param {String} ModuleName 
     * @returns a success message if the module is edited successfully
     * @returns an error message if the module is not found (should never happen, as valid modules are only loaded)
     */
    async editModule(ModuleCode, ModuleName){
        const query = 'UPDATE module SET ModuleName = ? WHERE ModuleCode = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [ModuleName, ModuleCode], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Module edited successfully'});
                }
            });
        });
    }
    /**
     * Adds a new lecturer to the database.
     * @param {String} MarkerEmail 
     * @param {String} Name 
     * @param {String} Surname 
     * @param {String} Password 
     * @param {String} MarkerRole 
     * @returns a success message if the lecturer is added successfully
     * @returns an error message if the lecturer already exists
     */
    async addLecturer(MarkerEmail, Name, Surname, Password, MarkerRole){
        const query = 'INSERT INTO marker (MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Name, Surname, Password, MarkerRole, 'TickPerMark'], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Lecturer added successfully'});
                }
            });
        });
    }

    /**
     * Deletes a lecturer from the database.
     * @param {String} MarkerEmail 
     * @returns a success message if the lecturer is deleted successfully
     * @returns an error message if the lecturer is not found (should never happen, as valid lecturers are only loaded)
     */
    async deleteMarker(MarkerEmail){
        const query = 'DELETE FROM marker WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Lecturer deleted successfully'});
                }
            });
        });
    }

    /**
     * Edits a lecturer in the database.
     * @param {String} MarkerEmail 
     * @param {String} Name 
     * @param {String} Surname 
     * @param {String} Password 
     * @returns a success message if the lecturer is edited successfully
     * @returns an error message if the lecturer is not found (should never happen, as valid lecturers are only loaded)
     */
    async editLecturer(MarkerEmail, Name, Surname, Password){
        const query = 'UPDATE marker SET Name = ?, Surname = ?, Password = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [Name, Surname, Password, MarkerEmail], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Lecturer edited successfully'});
                }
            });
        });
    }

    async addDemiMarker(MarkerEmail, Name, Surname, Password, MarkerRole){
        const query = 'INSERT INTO marker (MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Name, Surname, Password, MarkerRole, 'TickPerMark'], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Demi Marker added successfully'});
                }
            });
        });
    }

    /**
     * Edits a marker in the database.
     * @param {String} MarkerEmail 
     * @param {String} Name 
     * @param {String} Surname 
     * @param {String} Password 
     * @returns a success message if the marker is edited successfully
     * @returns an error message if the marker is not found (should never happen, as valid markers are only loaded)
     */
    async editMarker(MarkerEmail, Name, Surname, Password){
        const query = 'UPDATE marker SET Name = ?, Surname = ?, Password = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [Name, Surname, Password, MarkerEmail], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Marker edited successfully'});
                }
            });
        });
    }
    /**
     * Deletes an assessment (and all its submissions) from the database
     * @param {number} AssessmentID - The ID of the assessment 
     * @returns a success message if the assessment is deleted successfully
     * @returns an error message if the assessment is not found (should never happen, as valid assessments are only loaded)
     */
    deleteSubmissions(AssessmentID){
        const query = 'DELETE FROM submission WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    return false
                } else {
                    return true
                }
            });
        });
    }
    /**
     * Method to delete an assessment
     * First attempts to delete all submissions, then proceeds to delete an assessment
     * @param {int} AssessmentID 
     * @returns a success message if the assessment is deleted successfully
     * @returns an error message if the assessment is not found (should never happen, as valid assessments are only loaded)
     */
    async deleteAssessment(AssessmentID){
        if (!this.deleteSubmissions(AssessmentID)){
            return {error: 'Failed to delete assessment'};
        }
        const query = 'DELETE FROM assessment WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Assessment deleted successfully'});
                }
            });
        });
    }

    async getAssessmentInfo(AssessmentID){
        const query = 'SELECT MarkerEmail, AssessmentName, ModuleCode, ModEmail, TotalMark FROM assessment WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    }
    /**
     * Method to update the total submission mark, which is called automatically after a submission is marked
     * @param {int} SubmissionID 
     * @param {number}} SubmissionStatus 
     */
    async updateSubmissionMark(SubmissionID, SubmissionMark){
        const query = 'UPDATE submission SET SubmissionMark = ? WHERE SubmissionID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [SubmissionMark, SubmissionID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
}
module.exports = ClientThreads