import { db } from "./firebase-config.js";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const leaderboardList = document.getElementById("leaderboardList");

function getTodayId() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

async function loadLeaderboard() {
  try {
    const todayId = getTodayId();

    const scoresRef = collection(
      db,
      "leaderboards",
      "letters-in",
      "days",
      todayId,
      "scores"
    );

    const q = query(
      scoresRef,
      orderBy("score", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      leaderboardList.innerHTML = "<p>No scores submitted yet today.</p>";
      return;
    }

    let html = "<ol>";

    snapshot.forEach((doc) => {
      const data = doc.data();
      html += `<li>${data.username || "Player"}</li>`;
    });

    html += "</ol>";
    leaderboardList.innerHTML = html;

  } catch (error) {
    leaderboardList.innerHTML = `<p>Error loading leaderboard: ${error.message}</p>`;
  }
}

loadLeaderboard();