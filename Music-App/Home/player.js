import { auth } from "../Login/firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const audio = document.getElementById("audio-player");

/* Mid controls */
const midPrevBtn = document.querySelector(".controls .btn-prev");
const midPlayBtn = document.querySelector(".controls .btn-play");
const midNextBtn = document.querySelector(".controls .btn-next");

/* Footer controls */
const footPrevBtn = document.querySelector(".footer-player .btn-prev");
const footPlayBtn = document.querySelector(".footer-player .btn-play");
const footNextBtn = document.querySelector(".footer-player .btn-next");

/* Header display */
const titleEl = document.querySelector(".track-title");
const artistEl = document.querySelector(".track-artist");

/* Footer display */
const footTitleEl = document.querySelector(".footer-player .current-title");
const footArtistEl = document.querySelector(".footer-player .current-artist");

/* Progress bar */
const currentTimeEl = document.querySelector(".footer-player .current-time");
const durationEl = document.querySelector(".footer-player .duration");
const progressBar = document.querySelector(".footer-player .progress-filled");
const progressContainer = document.querySelector(".progress-bar");
const preview = document.querySelector(".progress-preview");

function fetchTracks() {
  return JSON.parse(localStorage.getItem("myLibrary") || "[]");
}

function clearUI(msg = "--") {
  audio.pause();
  audio.src = "";
  titleEl.textContent = msg;
  artistEl.textContent = "";
  footTitleEl.textContent = msg;
  footArtistEl.textContent = "";
  resetProgress();
  updatePlayIcons(false);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/* state variables */
let playlist   = [];
let current    = 0;
let isDragging = false;

/* Init Player */
document.addEventListener("DOMContentLoaded", () => {
  playlist = fetchTracks();
  current  = parseInt(localStorage.getItem("currentTrack") || "0", 10);
});

onAuthStateChanged(auth, () => {
  playlist = fetchTracks();
  current  = parseInt(localStorage.getItem("currentTrack") || "0", 10);
  if (current >= playlist.length) current = 0;

  if (!auth.currentUser) {
    clearUI("Please log in to play music");
    return;
  }

  if (playlist.length) {
    loadTrack(current);
    if (sessionStorage.getItem("playOnLoad") === "true") {
      audio.play().then(() => updatePlayIcons(true)).catch(() => {});
      sessionStorage.removeItem("playOnLoad");
    }
  } else {
    clearUI("No songs in library");
  }
});

function loadTrack(i) {
  const item = playlist[i];
  if (!item) { clearUI(); return; }

  audio.src = item.url;
  const name = item.displayName || item.name;
  titleEl.textContent      = name;
  artistEl.textContent     = "Local File";
  footTitleEl.textContent  = name;
  footArtistEl.textContent = "Local File";

  updatePlayIcons(false);
  resetProgress();

  audio.addEventListener(
    "loadedmetadata",
    () => (durationEl.textContent = formatTime(audio.duration)),
    { once: true }
  );
}

function togglePlay() {
  if (!playlist.length) return;
  if (audio.paused) { audio.play();  updatePlayIcons(true);  }
  else              { audio.pause(); updatePlayIcons(false); }
}
function updatePlayIcons(isPlaying) {
  const icon = isPlaying ? "&#x23f8;" : "&#x25b6;";
  midPlayBtn.innerHTML  = icon;
  footPlayBtn.innerHTML = icon;
}
function playPrev() {
  if (!playlist.length) return;
  current = (current - 1 + playlist.length) % playlist.length;
  localStorage.setItem("currentTrack", current);
  loadTrack(current);
  audio.play();
  updatePlayIcons(true);
}
function playNext() {
  if (!playlist.length) return;
  current = (current + 1) % playlist.length;
  localStorage.setItem("currentTrack", current);
  loadTrack(current);
  audio.play();
  updatePlayIcons(true);
}
function resetProgress() {
  progressBar.style.width = "0%";
  currentTimeEl.textContent = formatTime(0);
  durationEl.textContent    = formatTime(0);
}

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.style.width = pct + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

progressContainer.addEventListener("mousedown", e => {
  isDragging = true;
  progressContainer.classList.add("dragging");
  updatePreview(e);
});
window.addEventListener("mousemove", e => isDragging && updatePreview(e));
window.addEventListener("mouseup", e => {
  if (!isDragging) return;
  isDragging = false;
  progressContainer.classList.remove("dragging");
  const rect = progressContainer.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) audio.currentTime = pct * audio.duration;
  preview.style.width = "0";
});
function updatePreview(e) {
  const rect = progressContainer.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  preview.style.width = pct * 100 + "%";
}

/* Play next song when ended */
audio.addEventListener("ended", playNext);

/* Bind buttons */
midPlayBtn .onclick = togglePlay;
midPrevBtn .onclick = playPrev;
midNextBtn .onclick = playNext;
footPlayBtn.onclick = togglePlay;
footPrevBtn.onclick = playPrev;
footNextBtn.onclick = playNext;

export { loadTrack, updatePlayIcons };