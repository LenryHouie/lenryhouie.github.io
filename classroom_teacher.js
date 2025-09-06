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

async function generateMathQuestion() {
  const response = await fetch("https://simple-math-problems.p.rapidapi.com/addition/single", {
    method: "GET",
    headers: {
      "x-rapidapi-key": "ff85a721a1msh5f52f0e3cf7ca4cp11b699jsn1574e0152b07",
      "x-rapidapi-host": "simple-math-problems.p.rapidapi.com"
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  const data = await response.json();
  // Suppose API gives you { problem: "5 + 3", solution: 8 }
  console.log("Generated Question:", data);
  return {
    question: data.problem || data.question,
    solution: data.solution || data.answer
  };
}

document.getElementById("createQuestionBtn").addEventListener("click", async () => {
  if (!classroomData) return alert("Classroom data not loaded.");

  const { question, solution } = await generateMathQuestion();

  await addDoc(collection(db, "classrooms", classroomId, "questions"), {
    classroomId,
    subject: classroomData.subject,
    question,
    solution,
    createdAt: Timestamp.now()
  });
  console.log("Question saved to Firestore:", question);
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
