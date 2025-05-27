// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Paste your Firebase config here
const firebaseConfig = {
  apiKey: "AIzaSyC7q11pgl578bVjPwDXojkFbyeO2M47Hqo",
  authDomain: "your-1fa70.firebaseapp.com",
  projectId: "tamaed-1fa70",
  appId: "1:305146833900:web:b67ca0a651993e37a7eec9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// DOM elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const userInfo = document.getElementById("user-info");

document.getElementById("signup").addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(userCredential => {
      userInfo.innerText = `Signed up as: ${userCredential.user.email}`;
    })
    .catch(err => alert(err.message));
});

document.getElementById("login").addEventListener("click", () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then(userCredential => {
      userInfo.innerText = `Logged in as: ${userCredential.user.email}`;
    })
    .catch(err => alert(err.message));
});

document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => userInfo.innerText = "Logged out")
    .catch(err => alert(err.message));
});

// Keep track of login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfo.innerText = `Authenticated: ${user.email}`;
  } else {
    userInfo.innerText = "Not logged in";
  }
});
