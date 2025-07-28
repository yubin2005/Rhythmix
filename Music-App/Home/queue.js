import { auth } from "../Login/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Select DOM elements
const btnQueue   = document.querySelector(".btn-queue");
const queuePanel = document.getElementById("queue-panel");
const queueList  = document.getElementById("queue-list");
const closeBtn   = document.getElementById("close-queue");


onAuthStateChanged(auth, user => {
  if (queuePanel.classList.contains("visible")) {
    renderQueue();
  }
});

// 2. Render the playlist panel
function renderQueue() {
  queueList.innerHTML = "";

  // If not logged in, show login prompt
  if (!auth.currentUser) {
    queueList.innerHTML = `
      <li>
        <a href="../Login/login.html" class="login-link">
          Please log in to see your playlist.
        </a>
      </li>`;
    return;
  }

  // If logged in, read library data from localStorage
  const lib = JSON.parse(localStorage.getItem('myLibrary') || '[]');

  // If library is empty, show empty-state message
  if (lib.length === 0) {
    queueList.innerHTML = `
      <li>
        You have no saved files.
      </li>`;
    return;
  }

  // Otherwise, list each saved file
  lib.forEach((item, idx) => {
    const li = document.createElement("li");
    li.className = "file-item";
    li.textContent = item.displayName || item.name;
    // Click to play
    li.addEventListener("click", () => {
      localStorage.setItem("currentTrack", idx);
      sessionStorage.setItem("playOnLoad", "true");
      window.location.href = "../Home/music.html";
      hideQueue();
    });
    queueList.appendChild(li);
  });
}

function showQueue() {
  renderQueue();
  queuePanel.classList.add("visible");
}
function hideQueue() {
  queuePanel.classList.remove("visible");
}

btnQueue.addEventListener("click", e => {
  e.stopPropagation();  // prevent click from bubbling up
  queuePanel.classList.contains("visible") ? hideQueue() : showQueue();
});

closeBtn.addEventListener("click", e => {
  e.stopPropagation();
  hideQueue();
});

// Hide when clicking the backdrop
queuePanel.addEventListener("click", e => {
  if (e.target === queuePanel) hideQueue();
});

// Hide when clicking anywhere else
document.addEventListener("click", e => {
  if (queuePanel.classList.contains("visible") && !btnQueue.contains(e.target)) {
    hideQueue();
  }
});
