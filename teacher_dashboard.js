import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// 🔐 Use your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "index.html";
    }

    document.getElementById("create-class-form").addEventListener("submit", async (e) => {
      e.preventDefault();

      const subject = document.getElementById("subject").value.trim();
      const grade = document.getElementById("grade").value;

      if (!subject || !grade) {
        alert("Please complete all fields.");
        return;
      }

      const classCode = generateClassCode();

      try {
        await addDoc(collection(db, "classrooms"), {
          teacherId: user.uid,
          classCode,
          subject,
          gradeLevel: grade,
          createdAt: Timestamp.now()
        });

        document.getElementById("class-info").innerHTML = `
          <p><strong>Classroom Created!</strong></p>
          <p>Class Code: <code>${classCode}</code></p>
          <p>Subject: ${subject}</p>
          <p>Grade: ${grade}</p>
        `;
      } catch (err) {
        console.error("Error creating classroom:", err);
        alert("Failed to create class. Try again.");
      }
    });
  });

  function generateClassCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
