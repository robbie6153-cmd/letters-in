import { auth, db } from "./firebase-config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const usernameEl = document.getElementById("profileUsername");
const emailEl = document.getElementById("profileEmail");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  emailEl.textContent = user.email || "No email found";

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      usernameEl.textContent =
        data.username ||
        data.displayName ||
        user.email.split("@")[0];
    } else {
      usernameEl.textContent = user.email.split("@")[0];
    }

  } catch (error) {
    console.error("Error loading profile:", error);
    usernameEl.textContent = user.email.split("@")[0];
  }
});