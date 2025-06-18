import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("signup").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const grade = document.getElementById("grade").value;
  const subject = document.getElementById("subject").value;

  if (!name || !email || !password || !grade || !subject) {
    alert("Please fill in all fields.");
    return; // Stop the function before try runs
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "teachers", user.uid), {
      name,
      email,
      role: "teacher",
      grade,
      subject
    });

    window.location.href = "teacher_dashboard.html";
  } catch (error) {
    alert(error.message);
  }
});
