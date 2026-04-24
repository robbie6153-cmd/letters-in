import { db } from "./firebase-config.js";

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const leaderboardList = document.getElementById("leaderboardList");

async function loadLeaderboard() {
  try {
    const scoresRef = collection(db, "leaderboards", "letters-in", "scores");

    const q = query(
      scoresRef,
      orderBy("score", "desc"),
      limit(20)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      leaderboardList.innerHTML = "<p>No scores submitted yet.</p>";
      return;
    }

    let html = "<ol>";

    snapshot.forEach((doc) => {
      const data = doc.data();
      html += `<li><strong>${data.username || "Player"}</strong> — ${data.score}</li>`;
    });

    html += "</ol>";
    leaderboardList.innerHTML = html;

  } catch (error) {
    leaderboardList.innerHTML = `<p>Error loading leaderboard: ${error.message}</p>`;
  }
}

loadLeaderboard();