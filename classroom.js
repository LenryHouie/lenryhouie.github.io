import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  Timestamp,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
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

// Template question generator
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

  const questionParams = {
    subject: classroomData.subject,
    topic,
    gradeLevel: classroomData.gradeLevel,
    difficulty
  };

  const questionText = generateTemplateQuestion(questionParams);

  try {
    await addDoc(collection(db, "questions"), {
      classroomId,
      ...questionParams,
      text: questionText,
      createdAt: Timestamp.now()
    });

    document.getElementById("questionStatus").textContent = "Question created successfully!";
    document.getElementById("topicInput").value = ""; // Clear input field
    loadQuestions();
  } catch (error) {
    console.error("Error creating question:", error);
    document.getElementById("questionStatus").textContent = "Error creating question.";
  }
});

document.getElementById("deleteQuestionBtn").addEventListener("click", async () => {
  const confirmDelete = confirm("Are you sure you want to delete this question?");
  if (confirmDelete) {
    await deleteDoc(doc(db, "questions", classroomId));
    alert("Question deleted successfully."); // Redirect to homepage or another page
  }
});

const questionsRef = collection(db, "classrooms", classroomId, "questions");

// Listen for real-time updates
onSnapshot(questionsRef, (snapshot) => {
  const questionsList = document.getElementById("questions-List");
  questionList.innerHTML = ""; //Clear before rendering


  snapshot.forEach((questionDoc) => {
    const question = doc.data();
   const div = document.createElement("div");
   div.textContent = `${question.difficulty} - ${question.topic} : ${question.text || "(no question text)"}`;
    questionList.appendChild(div);
  });
});
