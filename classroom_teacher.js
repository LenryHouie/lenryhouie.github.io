// TamaED JavaScript Project Canvas

// Firebase initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, Timestamp, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "tamaed-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Example classroom ID for testing
const classroomId = "TEST_CLASSROOM_ID";

// Fetch classroom info
let classroomData = null;
async function fetchClassroomInfo() {
    const classroomDoc = await getDoc(doc(db, "classrooms", classroomId));
    if (classroomDoc.exists()) {
        classroomData = classroomDoc.data();
    } else {
        console.log("Classroom not found.");
    }
}
fetchClassroomInfo();

// Generate and store trivia question
async function generateTriviaQuestion() {
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener('readystatechange', async function() {
        if (this.readyState === this.DONE) {
            const response = JSON.parse(this.responseText);
            if (response.length > 0) {
                const questionText = response[0].question;
                const answer = response[0].answer;

                try {
                    await addDoc(collection(db, "classrooms", classroomId, "questions"), {
                        question: questionText,
                        answer: answer,
                        createdAt: Timestamp.now()
                    });
                    console.log("Question created!");
                } catch (error) {
                    console.error("Error storing question:", error);
                }
            }
        }
    });

    xhr.open('GET', 'https://trivia-by-api-ninjas.p.rapidapi.com/v1/trivia?category=%5D');
    xhr.setRequestHeader('x-rapidapi-key', 'YOUR_API_KEY');
    xhr.setRequestHeader('x-rapidapi-host', 'trivia-by-api-ninjas.p.rapidapi.com');
    xhr.send(data);
}

// Button listener for creating question
document.getElementById("createQuestionBtn")?.addEventListener("click", () => {
    if (!classroomData) return console.log("Classroom data not loaded.");
    generateTriviaQuestion();
});

// Display questions with delete functionality
const questionsRef = collection(db, "classrooms", classroomId, "questions");
onSnapshot(questionsRef, (snapshot) => {
    const questionList = document.getElementById("questionList");
    if (!questionList) return;
    questionList.innerHTML = "";

    snapshot.forEach((questionDoc) => {
        const question = questionDoc.data();
        const div = document.createElement("div");
        div.textContent = `Question: ${question.question}, Answer: ${question.answer}`;

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
                await deleteDoc(doc(db, "classrooms", classroomId, "questions", questionDoc.id));
                console.log('Question deleted.');
            }
        });

        div.appendChild(deleteBtn);
        questionList.appendChild(div);
    });
});
