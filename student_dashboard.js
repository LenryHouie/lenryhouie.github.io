import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const studentRef = doc(db, "students", user.uid);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) {
    alert("Student data not found.");
    return;
  }

  const studentData = studentSnap.data();
  document.getElementById("student-info").innerHTML = `
    <p>${user.name}<br>Email: ${user.email}</p>
  `;

  loadJoinedClassrooms(studentData.joinedClasses || [], db);

  document.getElementById("join-classroom-btn").addEventListener("click", async () => {
    const code = document.getElementById("class-code-input").value.trim();

    if (!code) {
      alert("Please enter a class code.");
      return;
    }

    // Look for classroom with this code
    const q = query(collection(db, "classrooms"), where("classCode", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("No classroom found with that code.");
      return;
    }

    const classroomDoc = querySnapshot.docs[0];
    const classroomId = classroomDoc.id;

    // Update student document with new class ID
    await updateDoc(studentRef, {
      joinedClasses: arrayUnion(classroomId)
    });

    alert(`Joined classroom with code: ${code}`);
    loadJoinedClassrooms([...studentData.joinedClasses || [], classroomId], db);
  });
});

async function loadJoinedClassrooms(classroomIds, db) {
  const classroomList = document.getElementById("classroom-list");
  classroomList.innerHTML = "";

  for (const id of classroomIds) {
    const classroomSnap = await getDoc(doc(db, "classrooms", id));
    if (classroomSnap.exists()) {
      const classroom = classroomSnap.data();
      const div = document.createElement("div");
      div.className = "classroom";
      div.innerHTML = `
        <p>Class Code: ${classroom.classCode}</p>
        <button onclick="window.location.href='classroom.html?id=${id}'">Go to Classroom</button>
      `;
      classroomList.appendChild(div);
    }
  }
}
