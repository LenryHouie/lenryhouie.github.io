import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

const db = getFirestore(app);
const urlParams = new URLSearchParams(window.location.search);
const classroomId = urlParams.get("id");

let classroomData = null;

async function fetchClassroomInfo() {
  const classroomDoc = await getDoc(doc(db, "classrooms", classroomId));
  if (classroomDoc.exists()) {
    classroomData = classroomDoc.data();
  } else {
    alert("Classroom not found.");
  }
}

function generateTemplateQuestion({ subject, topic, gradeLevel, difficulty }) {
  return `(${difficulty}) Grade ${gradeLevel} ${subject} - Topic: ${topic}
Q: Explain one key idea about ${topic} in ${subject}.`;
}

document.getElementById("createQuestionBtn").addEventListener("click", async () => {
  if (!classroomData) return alert("Classroom data not loaded.");

  const topic = document.getElementById("topicInput").value.trim();
  const difficulty = document.getElementById("difficulty").value;

  if (!topic) {
    alert("Please enter a topic.");
    return;
  }

  const questionParams = {
    subject: classroomData.subject,
    topic: topic,
    gradeLevel: classroomData.gradeLevel,
    difficulty: difficulty
  };

  const questionText = generateTemplateQuestion(questionParams);

  const questionsRef = collection(db, "classrooms", classroomId, "questions");
  await addDoc(questionsRef, {
    ...questionParams,
    text: questionText,
    createdAt: new Date()
  });

  alert("Question added!");
});

fetchClassroomInfo();
