import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
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
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
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
      emailVerified: false,
      createdAt: serverTimestamp()
    });

    await sendEmailVerification(user);

    authStatus.textContent = "Account created. Please check your email to verify your account.";
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
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      authStatus.textContent = "Please verify your email before using leaderboards.";
    }
  } catch (error) {
    authStatus.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();

    if (!email) {
      authStatus.textContent = "Enter your email first.";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      authStatus.textContent = "Password reset email sent.";
    } catch (error) {
      authStatus.textContent = error.message;
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let username = user.email;

    if (userSnap.exists()) {
      username = userSnap.data().username;
    }

    authStatus.textContent = user.emailVerified
      ? "Logged in as " + username
      : "Logged in, but email not verified.";

    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    usernameInput.style.display = "none";

    window.currentRobTechUser = {
      uid: user.uid,
      email: user.email,
      username: username,
      emailVerified: user.emailVerified
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