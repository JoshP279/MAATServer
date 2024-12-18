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
        const query = `SELECT MarkerRole, MarkingStyle FROM marker WHERE MarkerEmail = ? AND Password = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Password], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results);
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
            SELECT AssessmentID, LecturerEmail, ModuleCode, AssessmentName, NumSubmissionsMarked, TotalNumSubmissions, ModEmail, AssessmentType, TotalMark 
            FROM assessment 
            WHERE 
                MarkerEmail LIKE CONCAT('%"', ?, '"%')
            OR LecturerEmail = ?
            OR ModEmail = ?`;
        
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, MarkerEmail, MarkerEmail], (error, results) => {
                if (error) {
                    console.error('SQL Error:', error);
                    reject(error);
                } else {
                    if (results.length > 0) {
                        const assessments = results.map(result => ({
                            assessmentID: result.AssessmentID,
                            lecturerEmail: result.LecturerEmail,
                            moduleCode: result.ModuleCode,
                            assessmentName: result.AssessmentName,
                            numMarked: result.NumSubmissionsMarked,
                            totalSubmissions: result.TotalNumSubmissions,
                            modEmail: result.ModEmail,
                            assessmentType: result.AssessmentType,
                            totalMarks: result.TotalMark
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
            SELECT AssessmentID, ModuleCode, AssessmentName, LecturerEmail, NumSubmissionsMarked, TotalNumSubmissions, ModEmail 
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
                            lecturerEmail: result.LecturerEmail,
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
            this.pool.query(query, [LecturerEmail,markerEmailString , AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, NumSubmissionsMarked, TotalNumSubmissions, AssessmentType], async (error, results) => {
                if (error) {
                    reject(error);
                }else{
                    const assessmentID = results.insertId;
                    try {
                        const promises = MarkerEmail.map(markerEmail => this.addAssessmentMarkerEmail(assessmentID, markerEmail));
                        await Promise.all(promises);
                        resolve(assessmentID);
                    } catch (insertError) {
                        reject(insertError);
                    }
                }
                });
            });
        }
    /**
     * Adds the marker email and assessment ID to the assessmentmarkers table
     * @param {int} AssessmentID 
     * @param {string} MarkerEmail 
     */
    async addAssessmentMarkerEmail(AssessmentID, MarkerEmail){
        console.log(AssessmentID, MarkerEmail);
        const query = 'INSERT INTO assessmentmarkers (MarkerEmail, AssessmentID) VALUES (?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
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
    async editAssessmentWithMemo(AssessmentID, MarkerEmail, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark) {
        const markerEmailString = JSON.stringify(MarkerEmail);
        const query = `
            UPDATE assessment 
            SET MarkerEmail = ?, 
                AssessmentName = ?, 
                ModuleCode = ?, 
                Memorandum = ?, 
                ModEmail = ?, 
                TotalMark = ?
            WHERE AssessmentID = ?
        `;
    
        return new Promise((resolve, reject) => {
            this.pool.query(query, [markerEmailString, AssessmentName, ModuleCode, Memorandum, ModEmail, TotalMark, AssessmentID], async (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    try {
                        const currentMarkers = await this.getCurrentMarkersForAssessment(AssessmentID);
    
                        // Step 2: Identify markers to add and remove
                        const markersToAdd = MarkerEmail.filter(markerEmail => !currentMarkers.includes(markerEmail));
                        const markersToRemove = currentMarkers.filter(markerEmail => !MarkerEmail.includes(markerEmail));
    
                        // Step 3: Remove markers that are no longer associated
                        const removePromises = markersToRemove.map(markerEmail => this.removeAssessmentMarkerEmail(AssessmentID, markerEmail));
                        await Promise.all(removePromises);
    
                        // Step 4: Add new markers that were added
                        const addPromises = markersToAdd.map(markerEmail => this.addAssessmentMarkerEmail(AssessmentID, markerEmail));
                        await Promise.all(addPromises);
    
                        resolve(results);
                    } catch (markerError) {
                        reject(markerError);
                    }
                }
            });
        });
    }
    
    async editAssessment(AssessmentID, MarkerEmail, AssessmentName, ModuleCode, ModEmail, TotalMark) {
        const markerEmailString = JSON.stringify(MarkerEmail);
        const query = `UPDATE assessment 
                                       SET MarkerEmail = ?, 
                                           AssessmentName = ?, 
                                           ModuleCode = ?, 
                                           ModEmail = ?, 
                                           TotalMark = ? 
                                       WHERE AssessmentID = ?`;
    
        return new Promise((resolve, reject) => {
        this.pool.query(query, [markerEmailString, AssessmentName, ModuleCode, ModEmail, TotalMark, AssessmentID], async (error, results) => {
            if (error) {
                reject(error);
            } else {
                try {
                    const currentMarkers = await this.getCurrentMarkersForAssessment(AssessmentID);

                    const markersToAdd = MarkerEmail.filter(markerEmail => !currentMarkers.includes(markerEmail));
                    const markersToRemove = currentMarkers.filter(markerEmail => !MarkerEmail.includes(markerEmail));

                    const removePromises = markersToRemove.map(markerEmail => this.removeAssessmentMarkerEmail(AssessmentID, markerEmail));
                    await Promise.all(removePromises);

                    const addPromises = markersToAdd.map(markerEmail => this.addAssessmentMarkerEmail(AssessmentID, markerEmail));
                    await Promise.all(addPromises);

                    resolve(results);
                } catch (markerError) {
                    reject(markerError);
                }
            }
        });
    });
    }
    
    async getCurrentMarkersForAssessment(AssessmentID) {
        const query = `SELECT MarkerEmail FROM assessmentmarkers WHERE AssessmentID = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    const markerEmails = results.map(row => row.MarkerEmail);
                    resolve(markerEmails);
                }
            });
        });
    }
    
    // Helper function to remove a marker from the assessment
    async removeAssessmentMarkerEmail(AssessmentID, MarkerEmail) {
        const query = `DELETE FROM assessmentmarkers WHERE AssessmentID = ? AND MarkerEmail = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID, MarkerEmail], (error, results) => {
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
   // Function to edit submission in the database
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

    let retryCount = 0;
        try {
            return await new Promise((resolve, reject) => {
                this.pool.query(
                    query,
                    [SubmissionPDF, StudentName, StudentSurname, SubmissionStatus, SubmissionFolderName, AssessmentID, StudentNum],
                    (error, results) => {
                        if (error) {
                            reject(error);
                        } else {
                            console.log('Submission edited successfully');
                            resolve(results);
                        }
                    }
                );
            });
        } catch (error) {
            if (error.code === 'ER_LOCK_DEADLOCK' && retryCount < maxRetries) {
                console.warn(`Deadlock detected. Retrying... (${retryCount + 1}/${maxRetries})`);
                retryCount++;
            } else {
                console.error('Failed to edit submission:', error);
                throw error;
            }
        }
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
    async addLecturer(MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle){
        const query = 'INSERT INTO marker (MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle], (error, results) => {
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
 * @returns {Promise} A success message if the lecturer is deleted successfully, or an error message otherwise.
 */
    async deleteMarker(MarkerEmail) {
        try {
            const assessmentMarkersDeleted = await this.deleteAssessmentMarkersEmail(MarkerEmail);
            const markersFromTableDeleted = await this.deleteMarkersFromAssessmentTable(MarkerEmail);
    
            if (assessmentMarkersDeleted && markersFromTableDeleted) {
                const query = 'DELETE FROM marker WHERE MarkerEmail = ?';
                return new Promise((resolve, reject) => {
                    this.pool.query(query, [MarkerEmail], (error, results) => {
                        if (error) {
                            reject(new Error('Failed to delete Marker from marker table'));
                        } else {
                            resolve({message: 'Lecturer deleted successfully'});
                        }
                    });
                });
            } else {
                return {error: 'Failed to delete Marker'};
            }
        } catch (error) {
            return {error: 'An error occurred while deleting Marker: ' + error.message};
        }
    }
    
    /**
     * Deletes assessment marker entries with a specific MarkerEmail.
     * @param {String} MarkerEmail 
     * @returns {Promise<boolean>} Returns true if deletion was successful.
     */
    async deleteAssessmentMarkersEmail(MarkerEmail){
        const query = 'DELETE FROM assessmentmarkers WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail], (error, results) => {
                if (error) {
                    console.error('Error deleting from assessmentmarkers:', error.message);
                    reject(false);
                } else {
                    console.log('Deleted assessment markers');
                    resolve(true);
                }
            });
        });
    }
    
    /**
     * Updates marker emails in the assessmentmarkers table by removing the specified MarkerEmail.
     * @param {String} markerEmail 
     * @returns {Promise<boolean>} Returns true if the operation is successful.
     */
    async deleteMarkersFromAssessmentTable(markerEmail) {
        const selectQuery = 'SELECT AssessmentID, MarkerEmail FROM assessment WHERE MarkerEmail LIKE ?';
        
        return new Promise(async (resolve, reject) => {
            try {
                const entries = await new Promise((resolve, reject) => {
                    this.pool.query(selectQuery, [`%${markerEmail}%`], (error, results) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(results);
                    });
                });
    
                for (const entry of entries) {
                    const assessmentID = entry.AssessmentID;
                    let emailArray = JSON.parse(entry.MarkerEmail);
                    
                    emailArray = emailArray.filter((email) => email !== markerEmail);
                    const updatedEmails = JSON.stringify(emailArray);
                    console.log('Updated emails:', updatedEmails);
                    const updateQuery = 'UPDATE assessment SET MarkerEmail = ? WHERE AssessmentID = ?';
                    await new Promise((resolve, reject) => {
                        this.pool.query(updateQuery, [updatedEmails, assessmentID], (error, result) => {
                            if (error) {
                                return reject(error);
                            }
                            resolve(result);
                        });
                    });
                }
    
                resolve(true);
            } catch (error) {
                console.error('Error in deleteMarkersFromAssessmentTable:', error.message);
                reject(false);
            }
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
    async editLecturer(MarkerEmail, Name, Surname, Password, MarkingStyle){
        const query = 'UPDATE marker SET Name = ?, Surname = ?, Password = ?, MarkingStyle = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [Name, Surname, Password, MarkingStyle, MarkerEmail], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Lecturer edited successfully'});
                }
            });
        });
    }

    async addDemiMarker(MarkerEmail, Name, Surname, Password, MarkerRole, MarkerStyle){
        const query = 'INSERT INTO marker (MarkerEmail, Name, Surname, Password, MarkerRole, MarkingStyle) VALUES (?,?,?,?,?,?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [MarkerEmail, Name, Surname, Password, MarkerRole, MarkerStyle], (error, results) => {
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
    async editMarker(MarkerEmail, Name, Surname, Password, MarkingStyle){
        const query = 'UPDATE marker SET Name = ?, Surname = ?, Password = ?, MarkingStyle = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [Name, Surname, Password, MarkingStyle, MarkerEmail], (error, results) => {
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
    async deleteSubmissions(AssessmentID) {
        console.log('Deleting submissions');
        
        // Step 1: Delete related questions first
        const questionsDeleted = await this.deleteQuestions(AssessmentID);
        if (!questionsDeleted) {
            console.error('Failed to delete questions, aborting deletion of submissions');
            return false; // Abort if question deletion fails
        }
    
        // Step 2: Delete submissions if questions are deleted successfully
        const query = 'DELETE FROM submission WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    console.error('Error deleting submissions:', error);
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }
    
    async deleteQuestions(AssessmentID) {
        console.log('Deleting questions');
        
        const query = 'DELETE FROM question WHERE SubmissionID IN (SELECT SubmissionID FROM submission WHERE AssessmentID = ?)';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    console.error('Error deleting questions:', error);
                    resolve(false);
                } else {
                    resolve(true);
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
        const deleteSubmissions = await this.deleteSubmissions(AssessmentID);
        const deleteMarkers = await this.deleteAssessmentMarkers(AssessmentID);
        if (deleteSubmissions && deleteMarkers){
            console.log('deleted submissions');
        const query = 'DELETE FROM assessment WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    console.log('deleted assessment');
                    resolve({message: 'Assessment deleted successfully'});
                }
            });
        });
    }else{
        return {error: 'Failed to delete assessment'};
    }
}

    deleteAssessmentMarkers(AssessmentID){
        const query = 'DELETE FROM assessmentmarkers WHERE AssessmentID = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [AssessmentID], (error, results) => {
                if (error) {
                    resolve(false);
                } else {
                    console.log('deleted assessment markers');
                    resolve(true);
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

    async updateMarkingStyle(markerEmail, markingStyle){
        const query = 'UPDATE marker SET MarkingStyle = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [markingStyle, markerEmail], (error, results) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    resolve({message: 'Marking style updated successfully'});
                }
            });
        });
    }

    async handleQuestionPerMark(SubmissionID, QuestionText, QuestionMark) {
        const selectQuery = `
            SELECT * FROM question WHERE SubmissionID = ? AND QuestionText = ?
        `;
        
        return new Promise((resolve, reject) => {
            this.pool.query(selectQuery, [SubmissionID, QuestionText], (error, results) => {
                if (error) {
                    return reject(error);
                }
                if (results.length > 0) {
                    const updateQuery = `
                        UPDATE question SET MarkAllocation = ? WHERE SubmissionID = ? AND QuestionText = ?
                    `;
                    this.pool.query(updateQuery, [QuestionMark, SubmissionID, QuestionText], (error, updateResults) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(updateResults);
                    });
                } else {
                    // Step 2b: If record does not exist, perform the insert
                    const insertQuery = `
                        INSERT INTO question (SubmissionID, QuestionText, MarkAllocation) 
                        VALUES (?, ?, ?)
                    `;
                    this.pool.query(insertQuery, [SubmissionID, QuestionText, QuestionMark], (error, insertResults) => {
                        if (error) {
                            return reject(error);
                        }
                        resolve(insertResults);
                    });
                }
            });
        });
    }

    async questionPerMark(SubmissionID){
        const query = `
        SELECT QuestionText, MarkAllocation 
        FROM question 
        WHERE SubmissionID = ?
        ORDER BY QuestionID ASC
    `;
    
    return new Promise((resolve, reject) => {
        this.pool.query(query, [SubmissionID], (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}
async updateSubmissionsMarks(assessmentID, oldAssessmentMark, newAssessmentMark) {
    const submissions = await this.getSubmissions(assessmentID);
    submissions.forEach(submission => {
        const mark = submission.submissionMark * oldAssessmentMark / 100;
        const newMark = mark / newAssessmentMark * 100;
        const clampedNewMark = Math.min(Math.max(0, newMark), 100);
        const roundedNewMark = Math.round(clampedNewMark * 100) / 100;
        console.log(`Updating submission ${submission.submissionID} from ${submission.submissionMark} to ${roundedNewMark}`);
        this.updateSubmissionMark(submission.submissionID, roundedNewMark);
    });

    console.log("All submissions updated successfully");
}
    async getSubmissionsByAssessmentID(assessmentID) {
        const query = `SELECT SubmissionID, SubmissionMark FROM submission WHERE assessmentID = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [assessmentID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
    async updateSubmissionMark(submissionID, newMark) {
        const query = `UPDATE submission SET SubmissionMark = ? WHERE SubmissionID = ?`;
        return new Promise((resolve, reject) => {
            this.pool.query(query, [newMark, submissionID], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async updatePassword(MarkerEmail, Password){
        const query = 'UPDATE marker SET Password = ? WHERE MarkerEmail = ?';
        return new Promise((resolve, reject) => {
            this.pool.query(query, [Password, MarkerEmail], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve({message: 'Password updated successfully'});
                }
            });
        });
    }
}    
module.exports = ClientThreads