import { loadTrack, updatePlayIcons } from "./player.js";  

const audio = document.getElementById("audio-player");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const searchResults = document.getElementById("search-results");
const searchBox = document.querySelector(".search-box");

// Read from localStorage
function fetchTracks() {
  return JSON.parse(localStorage.getItem("myLibrary") || "[]");
}

function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function doSearch() {
  const term = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";
  if (!term) {
    return searchResults.classList.add("hidden");
  }

  const playlist = fetchTracks();
  const matches = playlist.filter(item =>
    (item.displayName || item.name).toLowerCase().includes(term)
  );

  if (matches.length) {
    matches.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.displayName || item.name;
      li.addEventListener("click", () => {
        const idx = playlist.indexOf(item);
        localStorage.setItem("currentTrack", idx);
        loadTrack(idx);          
        audio.play();            
        updatePlayIcons(true);   
        searchResults.classList.add("hidden");
      });
      searchResults.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No matches";
    searchResults.appendChild(li);
  }

  searchResults.classList.remove("hidden");
}

const debounced = debounce(doSearch, 200);
searchInput.addEventListener("input", debounced);
searchBtn.addEventListener("click", doSearch);

document.addEventListener("click", e => {
  if (!searchBox.contains(e.target)) {
    searchResults.classList.add("hidden");
  }
});
