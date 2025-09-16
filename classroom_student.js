import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
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

let currentUser;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  const studentRef = doc(db, "students", user.uid);
  const studentSnap = await getDoc(studentRef);

  if (!studentSnap.exists()) {
    alert("Student data not found.");
    return;
  }

  const studentData = studentSnap.data();

  document.getElementById("student-info").innerHTML = `
    <p>${user.displayName || "Student"}<br>Email: ${user.email}</p>
  `;

  // Display pet info (if it exists)
  if (studentData.pet) {
    displayPet(studentData.pet);
  } else {
    displayNoPetMessage();
  }

  // Load a random question for this classroom
  const urlParams = new URLSearchParams(window.location.search);
  const classroomId = urlParams.get("id");
  if (classroomId) {
    loadRandomQuestion(classroomId);
  }
});

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

// Function to show message if no pet exists
function displayNoPetMessage() {
  const petContainer = document.getElementById("pet-info") || document.createElement("div");
  petContainer.id = "pet-info";
  petContainer.innerHTML = `
    <h3>No Pet Found</h3>
    <p>Please go to your dashboard to initialize your pet.</p>
  `;
  document.body.appendChild(petContainer);
}

// Function to load a random question from classroom
async function loadRandomQuestion(classroomId) {
  const questionsCol = collection(db, "classrooms", classroomId, "questions");
  const snapshot = await getDocs(questionsCol);
  const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (questions.length === 0) {
    document.getElementById("question-area").innerHTML = "<p>No questions available.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * questions.length);
  const randomQuestion = questions[randomIndex];

  const questionArea = document.getElementById("question-area") || document.createElement("div");
  questionArea.id = "question-area";
  questionArea.innerHTML = `
    <h3>Question</h3>
    <p>${randomQuestion.question}</p>
    <input type="text" id="answer-input" placeholder="Enter your answer" />
    <button id="submit-answer">Submit</button>
    <p id="answer-feedback"></p>
  `;
  document.body.appendChild(questionArea);

  const submitBtn = document.getElementById("submit-answer");
  submitBtn.onclick = async () => {
    const answer = document.getElementById("answer-input").value.trim();
    const feedback = document.getElementById("answer-feedback");

    if (answer.toLowerCase() === (randomQuestion.answer || "").toLowerCase()) {
      feedback.textContent = "✅ Correct!";
      setTimeout(() => {
      feedback.textContent = "";
    }, 2000); 
      await rewardPet(currentUser.uid);
      loadRandomQuestion(classroomId); // Load a new question
    } else {
      feedback.textContent = "❌ Incorrect. Try again.";
      setTimeout(() => {
      feedback.textContent = "";
    }, 2000); 
    }
  };
}

// Call this when a student answers a question correctly
export async function rewardPet(userId, expGain = 10, attentionGain = 5) {
  const studentRef = doc(db, "students", userId);
  const studentSnap = await getDoc(studentRef);
  if (!studentSnap.exists()) return;

  const pet = studentSnap.data().pet;
  if (!pet) return; // no pet to update

  let newExp = (pet.exp || 0) + expGain;
  let newLevel = pet.level || 0;

  if (newExp >= 100) {
    newLevel += 1;
    newExp = newExp - 100; // rollover excess exp
  }

  await updateDoc(studentRef, {
    "pet.exp": newExp,
    "pet.level": newLevel,
    "pet.attention": Math.min(100, (pet.attention || 0) + attentionGain)
  });

  // Update the pet display
  displayPet({
    ...pet,
    exp: newExp,
    level: newLevel,
    attention: Math.min(100, (pet.attention || 0) + attentionGain)
  });
}
