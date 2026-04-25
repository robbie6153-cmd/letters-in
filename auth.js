import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  deleteUser
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

let currentUser = null;
let currentUsername = null;

function getTodayId() {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  window.robTechCurrentUser = user;

  if (user) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      currentUsername = userSnap.data().username || user.email;
    } else {
      currentUsername = user.email;
    }

    window.robTechUsername = currentUsername;
  } else {
    currentUsername = null;
    window.robTechUsername = null;
  }
});

window.signUp = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const username = document.getElementById("username").value.trim();

  if (!email || !password || !username) {
    alert("Please enter email, password and username.");
    return;
  }

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      email: email,
      username: username,
      createdAt: serverTimestamp()
    });

    alert("Account created. You are now logged in.");
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
};

window.logIn = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter email and password.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Logged in.");
    window.location.href = "index.html";
  } catch (error) {
    alert(error.message);
  }
};

window.forgotPassword = async function () {
  const email = document.getElementById("email").value.trim();

  if (!email) {
    alert("Enter your email first.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent.");
  } catch (error) {
    alert(error.message);
  }
};

window.logOut = async function () {
  await signOut(auth);
  alert("Logged out.");
};

window.deleteRobTechAccount = async function () {
  const user = auth.currentUser;

  if (!user) {
    alert("You need to be logged in to delete your account.");
    return;
  }

  const confirmed = confirm(
    "Are you sure you want to delete your RobTechUK account?"
  );

  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);

    alert("Your RobTechUK account has been deleted.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Delete account error:", error);

    if (error.code === "auth/requires-recent-login") {
      alert("For security, please log out, log back in, then delete your account.");
    } else {
      alert(error.message);
    }
  }
};

window.submitRobTechScore = async function (score) {
  if (!auth.currentUser) {
    alert("You need to create an account or log in to submit your score.");
    return;
  }

  const uid = auth.currentUser.uid;
  const username = window.robTechUsername || auth.currentUser.email;
  const todayId = getTodayId();

  try {
    await setDoc(doc(db, "leaderboards", "letters-in", "days", todayId, "scores", uid), {
      uid: uid,
      username: username,
      score: score,
      game: "letters-in",
      day: todayId,
      createdAt: serverTimestamp()
    });

    alert("Score submitted to today's leaderboard!");
    window.location.href = "leaderboard.html";
  } catch (error) {
    alert(error.message);
  }
};