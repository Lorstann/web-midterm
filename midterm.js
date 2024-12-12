const courses = [];
const students = [];
const assignments = [];

// Course Adding
document.getElementById("courseForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Get the values from the form
    const courseCode = document.getElementById("courseCode").value;
    // Check if a course with the same course ID already exists
    if (courses.some(course => course.code === courseCode)) {
        document.getElementById("courseError").textContent = `Course with code "${courseCode}" already exists. Please use a unique code.`;
        return;
    }
    const courseName = document.getElementById("courseName").value;
    const instructorName = document.getElementById("instructorName").value;
    const instructorSurname = document.getElementById("instructorSurname").value;
    const courseCredit = parseInt(document.getElementById("courseCredit").value);
    const gradingScale = document.getElementById("gradingScale").value;

    // Add the new course to the array
    courses.push({
        code: courseCode,
        name: courseName,
        instructor: `${instructorName} ${instructorSurname}`,
        credit: courseCredit,
        scale: gradingScale,
    });

    document.getElementById("courseError").textContent = "";
    alert("Course added successfully!");

    // Update the dropdown menus for assignment and search filter
    updateCourseDropdown();
    populateCourseDropdown(); 
    this.reset();
});

// Attach event listener to the course form
document.getElementById("courseForm").addEventListener("submit", () => updateCourseTable());

// Student Adding
document.getElementById("studentForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Get the values from the form
    const studentID = document.getElementById("studentID").value;
    const studentName = document.getElementById("studentName").value;
    const studentSurname = document.getElementById("studentSurname").value;
    // Validate Student ID
    if (studentID.length !== 9 || parseInt(studentID) < 0) {
        document.getElementById("studentError").textContent = "Student ID must be exactly 9 digits and cannot be negative.";
        return;
    }
    // Check for duplicate Student ID
    if (students.some(student => student.id === studentID)) {
        document.getElementById("studentError").textContent = "Student ID already exists.";
        return;
    }
    // Add the new student to the array
    students.push({ 
        id: studentID, 
        name: studentName, 
        surname: studentSurname 
    });
    document.getElementById("studentError").textContent = "";
    alert("Student added successfully!");

    this.reset();
});

// Attach event listener to the student form
document.getElementById("studentForm").addEventListener("submit", () => updateStudentTable());

// Student Assignment
document.getElementById("assignmentForm").addEventListener("submit", function (event) {
    event.preventDefault();
    // Get the values from the form
    const courseCode = document.getElementById("selectCourse").value;
    const studentID = document.getElementById("assignmentStudentID").value;
    const midtermScore = parseFloat(document.getElementById("midtermScore").value);
    const finalScore = parseFloat(document.getElementById("finalScore").value);
    // Check if the Student ID exists
    if (!students.some(student => student.id === studentID)) {
        document.getElementById("assignmentError").textContent = "Student ID does not exist.";
        return;
    }
    // Check if the student is already assigned to the same course
    if (assignments.some(assignment => assignment.courseCode === courseCode && assignment.studentID === studentID)) {
        document.getElementById("assignmentError").textContent = `Student ID ${studentID} is already assigned to course ${courseCode}.`;
        return;
    }
    // Check if the course exists
    const course = courses.find(c => c.code === courseCode);
    if (!course) {
        document.getElementById("assignmentError").textContent = "Course does not exist.";
        return;
    }
    // Validate scores for students based on grading scale of the course
    assignments.push({ 
        courseCode, 
        studentID, 
        midtermScore, 
        finalScore 
    });

    document.getElementById("assignmentError").textContent = "";

    // Update the GPA for the student
    updateStudentTable();

    alert(`Student assigned successfully!`);

    this.reset();
});

// Attach event listener to the assignment form
document.getElementById("assignmentForm").addEventListener("submit", () => updateAssignmentTable());

// Update Course Dropdown
function updateCourseDropdown() {
    const selectCourse = document.getElementById("selectCourse");
    selectCourse.innerHTML = "";
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = course.code;
        option.textContent = `${course.code} - ${course.name} (${course.instructor})`;
        selectCourse.appendChild(option);
    });
}

// Convert numeric grade to letter grade based on the grading scale
function calculateLetterGrade(grade, scale) {
    if (scale === "10") {
        if (grade >= 90) return "A";
        else if (grade >= 80) return "B";
        else if (grade >= 70) return "C";
        else if (grade >= 60) return "D";
        else return "F";
    } else if (scale === "7") {
        if (grade >= 93) return "A";
        else if (grade >= 85) return "B";
        else if (grade >= 77) return "C";
        else if (grade >= 70) return "D";
        else return "F";
    }
    return "N/A";
}

// Convert letter grade to grade point for GPA calculation
function getGradePoint(letterGrade) {
    switch (letterGrade) {
        case "A": return 4.00;
        case "B": return 3.00;
        case "C": return 2.00;
        case "D": return 1.00;
        case "F": return 0.00;
        default: return 0.00;
    }
}

// Calculate GPA for a student
function calculateGPA(studentID) {
    // Find all assignments related to the student
    const studentAssignments = assignments.filter(assignment => assignment.studentID === studentID);
    if (studentAssignments.length === 0) return "N/A";
    // Calculate the total grade points and credits
    let totalGradePoints = 0;
    let totalCredits = 0;
    // Iterate over each assignment
    studentAssignments.forEach(assignment => {
        // Find the course for the assignment
        const course = courses.find(c => c.code === assignment.courseCode);
        if (course) {
            const numericGrade = (0.4 * assignment.midtermScore + 0.6 * assignment.finalScore);
            const letterGrade = calculateLetterGrade(numericGrade, course.scale);
            const gradePoint = getGradePoint(letterGrade);
            totalGradePoints += gradePoint * course.credit;
            totalCredits += course.credit;
        }
    });
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "N/A";
}

// Course Table
function updateCourseTable() {
    // Get the table body
    const courseTable = document.getElementById("courseTable").querySelector("tbody");
    courseTable.innerHTML = "";
    courses.forEach(course => {
        const row = courseTable.insertRow();
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.instructor}</td>
            <td>${course.credit}</td>
            <td>${course.scale}</td>
            <td>
                <button class="detailsCourseButton" data-code="${course.code}">Details</button>
                <button class="updateCourseButton" data-code="${course.code}">Update</button>
                <button class="deleteCourseButton" data-code="${course.code}">Delete</button>
            </td>
        `;
    });

    // Attach event listeners for action buttons
    document.querySelectorAll(".detailsCourseButton").forEach(button => {
        button.addEventListener("click", function () {
            const courseCode = this.getAttribute("data-code");
            showCourseDetails(courseCode);
        });
    });
    document.querySelectorAll(".updateCourseButton").forEach(button => {
        button.addEventListener("click", function () {
            const courseCode = this.getAttribute("data-code");
            openCourseUpdateDialog(courseCode);
        });
    });
    document.querySelectorAll(".deleteCourseButton").forEach(button => {
        button.addEventListener("click", function () {
            const courseCode = this.getAttribute("data-code");
            deleteCourse(courseCode);
        });
    });
}

// Course Details
function showCourseDetails(courseCode) {
    // Find the course by code
    const course = courses.find(c => c.code === courseCode);
    if (!course) return;
    // Find all assignments related to this course
    const courseAssignments = assignments.filter(ca => ca.courseCode === courseCode);
    if (courseAssignments.length === 0) {
        alert("No assignments found for this course.");
        return;
    }
    // Calculate statistics
    let passed = 0;
    let failed = 0;
    let totalScore = 0;
    // Iterate over each assignment
    courseAssignments.forEach(assignment => {
        const numericGrade = 0.4 * assignment.midtermScore + 0.6 * assignment.finalScore;
        const letterGrade = calculateLetterGrade(numericGrade, course.scale);
        if (letterGrade === "F") {
            failed++;
        } else {
            passed++;
        }
        totalScore += numericGrade;
    });
    // Calculate mean score
    const meanScore = (totalScore / courseAssignments.length).toFixed(2);
    // Display details
    document.getElementById("detailsPassed").textContent = `Number of Passed Students: ${passed}`;
    document.getElementById("detailsFailed").textContent = `Number of Failed Students: ${failed}`;
    document.getElementById("detailsMean").textContent = `Mean Score: ${meanScore}`;
    // Show the modal
    document.getElementById("courseDetails").style.display = "block";
}

// Close the course details modal
function closeCourseDetails() {
    document.getElementById("courseDetails").style.display = "none";
}

// Delete Course
function deleteCourse(courseCode) {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this course? This will remove all related data.")) return;
    // Remove the course from the `courses` array
    const courseIndex = courses.findIndex(course => course.code === courseCode);
    if (courseIndex !== -1) {
        courses.splice(courseIndex, 1);
    }
    // Remove all assignments related to the course
    for (let i = assignments.length - 1; i >= 0; i--) {
        if (assignments[i].courseCode === courseCode) {
            assignments.splice(i, 1);
        }
    }
    // Refresh the tables
    updateStudentTable();
    updateCourseTable();
    updateAssignmentTable();
    updateCourseDropdown();
    populateCourseDropdown();
    alert("Course and related data deleted successfully!");
}

// Update Course
function openCourseUpdateDialog(courseCode) {
    // Find the course by code
    const course = courses.find(c => c.code === courseCode);
    if (!course) return;
    // Get new values from the user
    const newCode = prompt("Enter new Course Code:", course.code);
    // Check for duplicate course codes
    if (courses.some(c => c.code === newCode && c.code !== courseCode)) {
        alert("Course Code already exists. Please use a unique code.");
        return;
    }
    const newName = prompt("Enter new Course Name:", course.name);
    const newInstructorName = prompt("Enter Instructor's Name:", course.instructor.split(" ")[0]);
    const newInstructorSurname = prompt("Enter Instructor's Surname:", course.instructor.split(" ")[1]);
    const newCredit = parseInt(prompt("Enter Course Credit (1-10):", course.credit));
    // Validate course credit range
    if (isNaN(newCredit) || newCredit < 1 || newCredit > 10) {
        alert("Course Credit must be a number and between 1 and 10.");
        return;
    }
    const newScale = prompt("Enter Grading Scale (7 or 10):", course.scale);
    // Validate grading scale
    if (newScale !== "7" && newScale !== "10") {
        alert("Grading Scale must be 7 or 10.");
        return;
    }
    // Validate all fields are filled
    if (!newCode || !newName || !newInstructorName || !newInstructorSurname || !newCredit || !newScale) {
        alert("All fields are required.");
        return;
    }
    // Update course details
    course.code = newCode;
    course.name = newName;
    course.instructor = `${newInstructorName} ${newInstructorSurname}`;
    course.credit = newCredit;
    course.scale = newScale;
    // Update assignments related to this course
    assignments.forEach(assignment => {
        if (assignment.courseCode === courseCode) {
            assignment.courseCode = newCode;
        }
    });
    // Refresh the tables
    updateStudentTable();
    updateCourseDropdown(); 
    populateCourseDropdown(); 
    updateCourseTable();
    updateAssignmentTable();

    alert("Course updated successfully!");
}

// Update Student Table
function updateStudentTable() {
    const studentTable = document.getElementById("studentTable").querySelector("tbody");
    studentTable.innerHTML = "";
    students.forEach(student => {
        const gpa = calculateGPA(student.id); // Calculate GPA for the student
        const row = studentTable.insertRow();
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.surname}</td>
            <td>${gpa}</td>
            <td>
                <button class="updateStudentButton" data-id="${student.id}">Update</button>
                <button class="deleteStudentButton" data-id="${student.id}">Delete</button>
            </td>
        `;
    });

    // Attach event listeners for action buttons
    document.querySelectorAll(".updateStudentButton").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            openStudentUpdateDialog(studentID);
        });
    });
    document.querySelectorAll(".deleteStudentButton").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            deleteStudent(studentID);
        });
    });
}


// Student Update
function openStudentUpdateDialog(studentID) {
    const student = students.find(s => s.id === studentID);
    if (!student) return;
    // Get new values from the user
    const newID = prompt("Enter new Student ID:", student.id);
    // Check for duplicate ID
    if (students.some(s => s.id === newID && s.id !== studentID)) {
        alert("Student ID already exists. Please use a unique ID.");
        return;
    }
    const newName = prompt("Enter new Student Name:", student.name);
    const newSurname = prompt("Enter new Student Surname:", student.surname);
    if (!newID || !newName || !newSurname) {
        alert("All fields are required.");
        return;
    }
    // Update student data
    student.id = newID;
    student.name = newName;
    student.surname = newSurname;
    // Update assignments with the new student ID
    assignments.forEach(assignment => {
        if (assignment.studentID === studentID) {
            assignment.studentID = newID;
        }
    });
    // Refresh the tables
    updateStudentTable();
    updateAssignmentTable();
    alert("Student updated successfully!");
}

// Student Delete
function deleteStudent(studentID) {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this student?")) return;
    // Remove the student from the `students` array
    const studentIndex = students.findIndex(student => student.id === studentID);
    if (studentIndex !== -1) {
        students.splice(studentIndex, 1);
    }
    // Remove all assignments related to the student
    for (let i = assignments.length - 1; i >= 0; i--) {
        if (assignments[i].studentID === studentID) {
            assignments.splice(i, 1);
        }
    }
    // Refresh the tables
    updateStudentTable();
    updateAssignmentTable();

    alert("Student and related data deleted successfully!");
}

// Assignment Table
function updateAssignmentTable() {
    const assignmentTable = document.getElementById("assignmentTable").querySelector("tbody");
    assignmentTable.innerHTML = "";

    assignments.forEach(assignment => {
        // Find the student and course for the assignment
        const student = students.find(s => s.id === assignment.studentID); 
        const course = courses.find(c => c.code === assignment.courseCode);
        const numericGrade = (0.4 * assignment.midtermScore + 0.6 * assignment.finalScore).toFixed(2);
        // Calculate letter grade based on the grading scale
        const letterGrade = course ? calculateLetterGrade(numericGrade, course.scale) : "N/A";
        // Add the assignment to the table
        const row = assignmentTable.insertRow();
        row.innerHTML = `
            <td>${assignment.courseCode}</td>
            <td>${assignment.studentID}</td>
            <td>${student ? `${student.name} ${student.surname}` : "Unknown"}</td>
            <td>${assignment.midtermScore}</td>
            <td>${assignment.finalScore}</td>
            <td>${letterGrade} (${numericGrade})</td>
            <td>
                <button class="updateAssignmentBtn" data-id="${assignment.studentID}" data-course="${assignment.courseCode}">Update</button>
                <button class="deleteAssignmentBtn" data-id="${assignment.studentID}" data-course="${assignment.courseCode}">Delete</button>
            </td>
        `;
    });
    // Attach event listeners for action buttons
    document.querySelectorAll(".updateAssignmentBtn").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            const courseCode = this.getAttribute("data-course");
            openAssignmentUpdateDialog(studentID, courseCode);
        });
    });
    document.querySelectorAll(".deleteAssignmentBtn").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            const courseCode = this.getAttribute("data-course");
            deleteAssignment(studentID, courseCode);
        });
    });
}

// Update Assignment
function openAssignmentUpdateDialog(studentID, courseCode) {
    const assignment = assignments.find(a => a.studentID === studentID && a.courseCode === courseCode);
    if (!assignment) return;
    // Get new values from the user
    const newCourseCode = prompt(`Enter new Course Code (Current: ${assignment.courseCode}):`, assignment.courseCode);
    // Validate new course code exists
    if (!courses.some(c => c.code === newCourseCode)) {
        alert(`Course Code "${newCourseCode}" does not exist.`);
        return;
    }
    const newStudentID = prompt(`Enter new Student ID (Current: ${assignment.studentID}):`, assignment.studentID);
    // Validate new student ID exists
    if (!students.some(s => s.id === newStudentID)) {
        alert(`Student ID "${newStudentID}" does not exist.`);
        return;
    }
    // Prevent assigning a student to the same course multiple times
    if (
        assignments.some(
            a => a.studentID === newStudentID && a.courseCode === newCourseCode && a !== assignment
        )
    ) {
        alert(`Student ID "${newStudentID}" is already assigned to Course Code "${newCourseCode}".`);
        return;
    }
    const newMidtermScore = parseFloat(prompt(`Enter new Midterm Score (Current: ${assignment.midtermScore}):`, assignment.midtermScore));
    if (isNaN(newMidtermScore) || newMidtermScore < 0 || newMidtermScore > 100) {
        alert("Midterm Score must be a number and between 0 and 100.");
        return;
    }
    const newFinalScore = parseFloat(prompt(`Enter new Final Score (Current: ${assignment.finalScore}):`, assignment.finalScore));
    if (isNaN(newFinalScore) || newFinalScore < 0 || newFinalScore > 100) {
        alert("Final Score must be a number and between 0 and 100.");
        return;
    }
    // Update the assignment
    assignment.courseCode = newCourseCode;
    assignment.studentID = newStudentID;
    assignment.midtermScore = newMidtermScore;
    assignment.finalScore = newFinalScore;
    // Refresh all tables
    updateStudentTable(); // Recalculate GPAs
    updateCourseTable();
    updateAssignmentTable();

    alert("Assignment updated successfully!");
}

// Delete Assignment
function deleteAssignment(studentID, courseCode) {
    // Confirm deletion
    if (!confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) return;
    // Find the index of the assignment to delete
    const assignmentIndex = assignments.findIndex(
        a => a.studentID === studentID && a.courseCode === courseCode
    );
    // Remove the assignment from the `assignments` array
    if (assignmentIndex !== -1) {
        assignments.splice(assignmentIndex, 1);
    } else {
        alert("Assignment not found.");
        return;
    }
    // Refresh all tables
    updateStudentTable();
    updateCourseTable();
    updateAssignmentTable();

    alert("Assignment deleted successfully!");
}

// Filter Assignments
function filterAssignments() {
    // Get the search term, selected course, and selected filter
    const searchTerm = document.getElementById("assignmentSearch").value.trim().toLowerCase();
    const selectedCourse = document.getElementById("courseFilter").value;
    const selectedFilter = document.querySelector(".filterButton.active")?.dataset.filter || "all";
    
    const assignmentTable = document.getElementById("assignmentTable").querySelector("tbody");
    assignmentTable.innerHTML = "";
    // Filter assignments based on the search term, course, and filter
    const filteredAssignments = assignments.filter(assignment => {
        const student = students.find(s => s.id === assignment.studentID);
        const course = courses.find(c => c.code === assignment.courseCode);
        if (!course || !student) return false;
        // Filter by course
        if (selectedCourse !== "all" && assignment.courseCode !== selectedCourse) return false;
        // Filter by search term (Student ID or Name)
        if (
            !assignment.studentID.includes(searchTerm) &&
            !(`${student.name} ${student.surname}`.toLowerCase().includes(searchTerm))
        ) {
            return false;
        }
        // Filter by pass/fail
        const numericGrade = (0.4 * assignment.midtermScore + 0.6 * assignment.finalScore);
        const letterGrade = calculateLetterGrade(numericGrade, course.scale);
        if (selectedFilter === "pass" && letterGrade === "F") return false;
        if (selectedFilter === "fail" && letterGrade !== "F") return false;
        // If all filters pass, return true
        return true;
    });
    // Populate the table with filtered assignments
    filteredAssignments.forEach(assignment => {
        const student = students.find(s => s.id === assignment.studentID);
        const course = courses.find(c => c.code === assignment.courseCode);
        const numericGrade = (0.4 * assignment.midtermScore + 0.6 * assignment.finalScore).toFixed(2);
        const letterGrade = course ? calculateLetterGrade(numericGrade, course.scale) : "N/A";
        
        const row = assignmentTable.insertRow();
        row.innerHTML = `
            <td>${assignment.courseCode}</td>
            <td>${assignment.studentID}</td>
            <td>${student ? `${student.name} ${student.surname}` : "Unknown"}</td>
            <td>${assignment.midtermScore}</td>
            <td>${assignment.finalScore}</td>
            <td>${letterGrade} (${numericGrade})</td>
            <td>
                <button class="updateAssignmentBtn" data-id="${assignment.studentID}" data-course="${assignment.courseCode}">Update</button>
                <button class="deleteAssignmentBtn" data-id="${assignment.studentID}" data-course="${assignment.courseCode}">Delete</button>
            </td>
        `;
    });

    // Reattach event listeners for action buttons
    document.querySelectorAll(".updateAssignmentBtn").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            const courseCode = this.getAttribute("data-course");
            openAssignmentUpdateDialog(studentID, courseCode);
        });
    });
    document.querySelectorAll(".deleteAssignmentBtn").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            const courseCode = this.getAttribute("data-course");
            deleteAssignment(studentID, courseCode);
        });
    });
    document.querySelectorAll(".filterButton").forEach(button => {
        button.addEventListener("click", function () {
            document.querySelectorAll(".filterButton").forEach(btn => btn.classList.remove("active"));
            this.classList.add("active");
            filterAssignments();
        });
    });
}

// Update the dropdown menu for searching assignments
function populateCourseDropdown() {
    const courseFilter = document.getElementById("courseFilter");
    courseFilter.innerHTML = `<option value="all">All Courses</option>`;
    courses.forEach(course => {
        const option = document.createElement("option");
        option.value = course.code;
        option.textContent = `${course.code} - ${course.name}`;
        courseFilter.appendChild(option);
    });
}

// Attach event listeners for search input and course filter
document.getElementById("assignmentSearch").addEventListener("input", filterAssignments);
document.getElementById("courseFilter").addEventListener("change", filterAssignments);

// Filter Students
function filterStudents(searchTerm) {
    const studentTable = document.getElementById("studentTable").querySelector("tbody");
    studentTable.innerHTML = "";
    // Filter students based on the search term
    const filteredStudents = students.filter(student =>
        student.id.includes(searchTerm) ||
        `${student.name} ${student.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    // Populate the table with filtered students
    filteredStudents.forEach(student => {
        const gpa = calculateGPA(student.id);
        const row = studentTable.insertRow();
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.surname}</td>
            <td>${gpa}</td>
            <td>
                <button class="updateStudentButton" data-id="${student.id}">Update</button>
                <button class="deleteStudentButton" data-id="${student.id}">Delete</button>
            </td>
        `;
    });
    // Reattach event listeners for action buttons
    document.querySelectorAll(".updateStudentButton").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            openStudentUpdateDialog(studentID);
        });
    });

    document.querySelectorAll(".deleteStudentButton").forEach(button => {
        button.addEventListener("click", function () {
            const studentID = this.getAttribute("data-id");
            deleteStudent(studentID);
        });
    });
}

// Attach event listener to search input
document.getElementById("studentSearch").addEventListener("input", filterStudents);