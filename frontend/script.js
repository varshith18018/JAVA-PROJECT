const API_URL = "http://localhost:9090/api/students";

function setFeedback(message, isError = false) {
  const feedback = document.getElementById("feedback");
  feedback.textContent = message;
  feedback.className = `feedback${isError ? " error" : ""}`;
}

function updateStudentCount(count) {
  const studentCount = document.getElementById("studentCount");
  if (studentCount) {
    studentCount.textContent = count;
  }
}

async function readResponse(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
}

async function loadStudents() {
  const tableBody = document.getElementById("studentTableBody");
  try {
    const data = await readResponse(await fetch(API_URL), "Unable to load students.");
    tableBody.replaceChildren();
    updateStudentCount(data.length);

    if (data.length === 0) {
      const row = tableBody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.className = "empty-state";
      cell.textContent = "No students yet. Add the first one above.";
      return;
    }

    data.forEach(student => {
      const row = tableBody.insertRow();
      [
        `#${student.id}`,
        student.name,
        student.email,
        student.course
      ].forEach(value => {
        const cell = row.insertCell();
        cell.textContent = value ?? "";
      });
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    updateStudentCount(0);
    tableBody.replaceChildren();
    const row = tableBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.className = "empty-state";
    cell.textContent = "Unable to load students right now.";
    setFeedback(error.message || "Unable to load students right now.", true);
  }
}

async function addStudent() {
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value.trim();

  if (!name || !email || !course) {
    setFeedback("Please fill in all fields before adding a student.", true);
    return;
  }

  const student = { name, email, course };
  try {
    await readResponse(await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    }), "Could not add student.");
    setFeedback("Student added successfully!");
    await loadStudents();
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("course").value = "";
  } catch (error) {
    console.error("Error adding student:", error);
    setFeedback(error.message || "Something went wrong while adding the student.", true);
  }
}

loadStudents();