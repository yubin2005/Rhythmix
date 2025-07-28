const moodBtns = document.querySelectorAll('.mood-buttons button');
const moodInput = document.querySelector('.mood-input');
const generateBtn = document.getElementById('generateBtn');
const loadingContainer = document.getElementById('loadingContainer');
const aiPlaylist = document.getElementById('aiPlaylist');

let selectedMood = null;

// pick a mood
moodBtns.forEach(btn => {
  btn.onclick = () => {
    moodBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedMood = btn.dataset.mood;
    generateBtn.disabled = false;
  };
});

// custom mood via Enter
moodInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    moodBtns.forEach(b => b.classList.remove('active'));
    selectedMood = moodInput.value.trim();
    if (!selectedMood) return;
    generateBtn.disabled = false;
  }
});

// generate playlist
generateBtn.onclick = async () => {
  if (!selectedMood) return;
  generateBtn.disabled = true;
  aiPlaylist.innerHTML = '';
  loadingContainer.classList.remove('hidden');

  try {
    const response = await fetch('http://localhost:3000/api/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood: selectedMood })
    });

    const { playlist } = await response.json();

    aiPlaylist.innerHTML = '';
    playlist.forEach(item => {
      const { title, artist, cover, preview } = item;
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        ${ cover
          ? `<img src="${cover}" alt="${title} cover" class="cover" />`
          : ''
        }
        <h3>${title}</h3>
        <p>${artist}</p>
        ${ preview
          ? `<audio src="${preview}" controls preload="none"></audio>`
          : `<small>No preview available</small>`
        }
      `;
      aiPlaylist.appendChild(card);
    });

  } catch (error) {
    console.error('Failed to fetch playlist:', error);
    aiPlaylist.textContent = 'Oops! Something went wrong. Please try again.';
  } finally {
    loadingContainer.classList.add('hidden');
    generateBtn.disabled = false;
  }
};
