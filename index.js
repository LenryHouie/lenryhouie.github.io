// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("login").addEventListener("click", async () => {
  const email = prompt("Email:");
  const password = prompt("Password:");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
    const studentDoc = await getDoc(doc(db, "students", user.uid));

    if (teacherDoc.exists()) {
      window.location.href = "teacher_dashboard.html";
    } else if (studentDoc.exists()) {
      window.location.href = "student_dashboard.html";
    } else {
      alert("No role found for this account.");
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
});
