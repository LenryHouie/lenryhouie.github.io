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

// 💡 Helper to generate a random class code
function generateClassCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}

// 👤 When teacher logs in
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "teachers", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const teacherData = docSnap.data();
      document.getElementById("teacher-info").innerHTML = `
        <p><strong>Name:</strong> ${teacherData.name}</p>
        <p><strong>Grade:</strong> ${teacherData.grade}</p>
        <p><strong>Subject:</strong> ${teacherData.subject}</p>
      `;

      // Listen for create-class button
      document
        .getElementById("create-class")
        .addEventListener("click", async () => {
          const newCode = generateClassCode();
          await updateDoc(docRef, { classCode: newCode });

          document.getElementById("class-code").textContent =
            "New Class Code: " + newCode;
        });
    } else {
      document.getElementById("teacher-info").textContent =
        "No teacher info found.";
    }
  } else {
    window.location.href = "signup_teacher.html"; // Redirect if not logged in
  }
});
