import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  Timestamp
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
    return;
  }

  const teacherId = user.uid; //defines teacher id

  document.getElementById("create-classroom-btn").addEventListener("click", async () => {
    const classCode = generateClassCode();

    try {
      await addDoc(collection(db, "classrooms"), {
        teacherId: teacherId,
        classCode: classCode,
        createdAt: Timestamp.now()
      });
      alert(`Classroom created! Code: ${classCode}`);
      loadClassrooms(teacherId);
    } catch (error) {
      console.error("Error creating classroom:", error);
      alert("Failed to create classroom.");
    }
  });

  // Load classrooms
  loadClassrooms(teacherId);
});

async function loadClassrooms(teacherId) {
  const classroomList = document.getElementById("classroom-list");
  classroomList.innerHTML = ""; // Clear current list

  const q = query(collection(db, "classrooms"), where("teacherId", "==", teacherId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const classroom = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <p>Class Code: ${classroom.classCode}</p>
      <button onclick="window.location.href='classroom.html?id=${doc.id}'">Go to Classroom</button>
    `;
    classroomList.appendChild(div);
  });
}

function generateClassCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}