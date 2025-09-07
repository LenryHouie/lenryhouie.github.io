import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
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

fetchClassroomInfo();

async function fetchClassroomInfo() {
  const classroomDoc = await getDoc(doc(db, "classrooms", classroomId));
  if (classroomDoc.exists()) {
    classroomData = classroomDoc.data();
  } else {
    alert("Classroom not found.");
  }
}

async function generateEquationQuestion() {
  const a = Math.floor(Math.random() * 10) + 1; // random 1–10
  const b = Math.floor(Math.random() * 20) - 10; // random -10–10

  try {
    const response = await fetch(`https://solve-math-equation-ax-b-0.p.rapidapi.com/?a=${a}&b=${b}`, {
      method: "GET",
      headers: {
        "x-rapidapi-key": "ff85a721a1msh5f52f0e3cf7ca4cp11b699jsn1574e0152b07",
        "x-rapidapi-host": "solve-math-equation-ax-b-0.p.rapidapi.com"
      }
    });

    if (!response.ok) throw new Error("API request failed: " + response.status);

    const result = await response.json();
    console.log("API response:", result);

    const questionText = `Solve: ${a}x + ${b} = 0`;
    const answer = result.solution; // depends on API field name

    // Store in Firestore like your other questions
    await addDoc(collection(db, "questions"), {
      classroomId,
      text: questionText,
      answer: answer,
      createdAt: Timestamp.now()
    });

    document.getElementById("questionStatus").textContent = "Question created!";
    loadQuestions();
  } catch (error) {
    console.error("Error generating equation:", error);
    document.getElementById("questionStatus").textContent = "Error generating question.";
  }
}

document.getElementById("createQuestionBtn").addEventListener("click", async () => {
  if (!classroomData) return alert("Classroom data not loaded.");
  generateEquationQuestion();
});

const questionsRef = collection(db, "classrooms", classroomId, "questions");

// Listen for real-time updates
onSnapshot(questionsRef, (snapshot) => {
  const questionList = document.getElementById("questionList");
  questionList.innerHTML = ""; // Clear existing list
  snapshot.forEach((questionDoc) => {
    const question = questionDoc.data();
    const div = document.createElement("div");
    div.textContent = `Question:${question.question}, Solution: ${question.solution}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.background = "red";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "5px";
    deleteBtn.style.cursor = "pointer";

    div.appendChild(deleteBtn);
    questionList.appendChild(div); // <-- Only append after adding the button

    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmDelete = confirm('Are you sure you want to delete this question?');
      if (confirmDelete) {
        await deleteDoc(doc(db, "classrooms", classroomId, "questions", questionDoc.id))
        alert('Question has been successfully deleted.');
      }
    })
    div.appendChild(deleteBtn);
  });
});
