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

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // user.uid is the logged-in user
    // gets user role from firestore
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const role = userSnap.data().role;
    // checks to see if student or teacher, and changes html accordingly
    if (role === "teacher") {
      document.getElementById("teacherSection").style.display = "block";
    } else if (role === "student") {
      document.getElementById("studentSection").style.display = "block";
    }
  } else {
    // if not logged in, send them to sign in
    window.location.href = "signin.html";
  }
});

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
  } catch (error) {
    console.error("Error creating question:", error);
    document.getElementById("questionStatus").textContent = "Error creating question.";
  }
});

const questionsRef = collection(db, "classrooms", classroomId, "questions");

// Listen for real-time updates
onSnapshot(questionsRef, (snapshot) => {
  const questionsList = document.getElementById("questions-List");
  questionList.innerHTML = ""; //Clear before rendering


  snapshot.forEach((questionDoc) => {
    const question = questionDoc.data();
   const div = document.createElement("div");
   div.textContent = `${question.difficulty} - ${question.topic} : ${question.text || "(no question text)"}`;
    questionList.appendChild(div);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    deleteBtn.style.marginLeft = "10px";
    deleteBtn.style.background = "red";
    deleteBtn.style.color = "white";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "5px";
    deleteBtn.style.cursor = "pointer";

    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const confirmDelete = confirm('Are you sure you want to delete this question?');
      if (confirmDelete) {
        await deleteDoc(doc(db, 'questions',questionDoc.id))
        alert('Question has been successfully deleted.');
      }
    })
    div.appendChild(deleteBtn);
    questionList.appendChild(div);
  });
});
