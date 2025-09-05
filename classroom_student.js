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

async function fetchClassroomInfo() {
    const classroomDoc = await getDoc(doc(db, 'classrooms', classroomId));
    if (classroommDoc.exists()){
        classroomData = classroomDoc.data()
    } else {
        alert("Classroom not found.")
    }
}

document.getElementById("loadQuestions").addEventListener("click", async () => {
    const questionsRef = collection(db, "classrooms", classroomId, "questions");
    const questionsSnapshot = await getDocs(questionsRef);
    questionsSnapshot.forEach((doc) => {
        const questionData = doc.data();
        console.log("Question:", questionData);
    });
});