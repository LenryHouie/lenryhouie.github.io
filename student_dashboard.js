import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  increment
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

  // If pet data doesn't exist, initialize it
  if (!studentData.pet) {
    await setDoc(studentRef, {
      pet: {
        type: "dog",
        attention: 100, // starts full
        level: 0,
        exp: 0
      }
    }, { merge: true });
  }

  // Load updated student data
  const updatedSnap = await getDoc(studentRef);
  const updatedData = updatedSnap.data();

  document.getElementById("student-info").innerHTML = `
    <p>${user.displayName || "Student"}<br>Email: ${user.email}</p>
  `;

  // Display pet info
  displayPet(updatedData.pet);

  loadJoinedClassrooms(updatedData.joinedClasses || [], db);

  document.getElementById("join-classroom-btn").addEventListener("click", async () => {
    const code = document.getElementById("class-code-input").value.trim();

    if (!code) {
      alert("Please enter a class code.");
      return;
    }

    const q = query(collection(db, "classrooms"), where("classCode", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("No classroom found with that code.");
      return;
    }

    const classroomDoc = querySnapshot.docs[0];
    const classroomId = classroomDoc.id;

    await updateDoc(studentRef, {
      joinedClasses: arrayUnion(classroomId)
    });

    alert(`Joined classroom with code: ${code}`);
    loadJoinedClassrooms([...(updatedData.joinedClasses || []), classroomId], db);
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
        <button onclick="window.location.href='classroom_student.html?id=${id}'">Go to Classroom</button>
      `;
      classroomList.appendChild(div);
    }
  }
}

// Function to display pet info
function displayPet(pet) {
  const petContainer = document.getElementById("pet-info") || document.createElement("div");
  petContainer.id = "pet-info";
  petContainer.innerHTML = `
    <h3>Your Pet: 🐶</h3>
    <p>Attention: ${pet.attention}</p>
    <p>Level: ${pet.level}</p>
    <p>EXP: ${pet.exp}</p>
  `;
  document.body.appendChild(petContainer);
}
