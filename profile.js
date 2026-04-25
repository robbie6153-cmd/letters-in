import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// Elements
const usernameEl = document.getElementById("profileUsername");
const emailEl = document.getElementById("profileEmail");

const timesPlayedEl = document.getElementById("timesPlayed");
const highestScoreEl = document.getElementById("highestScore");
const averageScoreEl = document.getElementById("averageScore");
const longestStreakEl = document.getElementById("longestStreak");
const currentStreakEl = document.getElementById("currentStreak");

// Auth check + load data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Basic info
  emailEl.textContent = user.email || "No email found";

  try {
    // Get user profile (username)
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      usernameEl.textContent = data.username || user.email.split("@")[0];
    } else {
      usernameEl.textContent = user.email.split("@")[0];
    }

    // Get stats
    const statsRef = doc(db, "users", user.uid, "stats", "lettersIn");
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists()) {
      const stats = statsSnap.data();

      timesPlayedEl.textContent = stats.timesPlayed || 0;
      highestScoreEl.textContent = stats.highestScore || 0;
      averageScoreEl.textContent = stats.averageScore || 0;
      longestStreakEl.textContent = stats.longestStreak || 0;
      currentStreakEl.textContent = stats.currentStreak || 0;
    }

  } catch (error) {
    console.error("Error loading profile:", error);
  }
});