import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");
const usernameInput = document.getElementById("authUsername");

const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("authStatus");

signupBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const username = usernameInput.value.trim();

  if (!email || !password || !username) {
    authStatus.textContent = "Enter email, password and username.";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      username: username,
      email: email,
      createdAt: serverTimestamp()
    });

    authStatus.textContent = "Account created: " + username;
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authStatus.textContent = "Enter email and password.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let username = user.email;

    if (userSnap.exists()) {
      username = userSnap.data().username;
    }

    authStatus.textContent = "Logged in as " + username;

    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    usernameInput.style.display = "none";

    window.currentRobTechUser = {
      uid: user.uid,
      email: user.email,
      username: username
    };
  } else {
    authStatus.textContent = "Not logged in";

    loginBtn.style.display = "inline-block";
    signupBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    usernameInput.style.display = "inline-block";

    window.currentRobTechUser = null;
  }
});