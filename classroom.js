import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const db = getFirestore(app);
const urlParams = new URLSearchParams(window.location.search);
const classroomId = urlParams.get("id");

let classroomData = null;

async function fetchClassroomInfo() {
  const classroomDoc = await getDoc(doc(db, "classrooms", classroomId));
  if (classroomDoc.exists()) {
    classroomData = classroomDoc.data();
  } else {
    alert("Classroom not found.");
  }
}

function generateTemplateQuestion({ subject, topic, gradeLevel, difficulty }) {
  return `(${difficulty}) Grade ${gradeLevel} ${subject} - Topic: ${topic}
Q: Explain one key idea about ${topic} in ${subject}.`;
}

document.getElementById("createQuestionBtn").addEventListener("click", async () => {
  if (!classroomData) return alert("Classroom data not loaded.");

  const topic = document.getElementById("topicInput").value.trim();
  const difficulty = document.getElementById("difficulty").value;

  if (!topic) {
    alert("Please enter a topic.");
    return;
  }

  try {
    await addDoc(collection(db, "questiosn"), {
      classroomID: classroomId,
      difficulty,
      topic,
      createdAt: Timestamp.now()
    })


  document.getElementById("questionStatus").textContent = "Questions created successfully!";
  document.getElementById("topicInput").value = ""; //Clear input field
  loadQuestions();
  } catch (error) {
    console.error("Error creating question:", error);
    document.getElementById("questionStatus").textContent = "Error creating question.";
  }
});

// 🔄 Load and display questions
async function loadQuestions() {
  const qList = document.getElementById("questionList");
  qList.innerHTML = "";

  const q = query(collection(db, "questions"), where("classroomId", "==", classroomId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const questionBox = document.createElement("div");
    questionBox.style.border = "1px solid #ccc";
    questionBox.style.padding = "10px";
    questionBox.style.margin = "10px 0";
    questionBox.style.display = "flex";
    questionBox.style.justifyContent = "space-between";
    questionBox.style.alignItems = "center";
    questionBox.style.borderRadius = "8px";
    questionBox.style.backgroundColor = "#f9f9f9";

    const text = document.createElement("span");
    text.textContent = `Topic: ${data.topic} | Difficulty: ${data.difficulty}`;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.backgroundColor = "transparent";
    deleteBtn.style.border = "none";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.color = "#cc0000";
    deleteBtn.title = "Delete this question";

    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "questions", docSnap.id));
      loadQuestions(); // Refresh list
    });

    questionBox.appendChild(text);
    questionBox.appendChild(deleteBtn);
    qList.appendChild(questionBox);
  });
}

loadQuestions();
