async function loadTrending() {
  try {
    const resp = await fetch('http://localhost:3000/api/trending');
    const { trending } = await resp.json();
    const list = document.querySelector('.trending-list');
    list.innerHTML = ''; 

    trending.forEach(item => {
      const { title, artist, cover, preview } = item;
      const li = document.createElement('li');
      li.className = 't-item';
      li.innerHTML = `
        ${ cover
            ? `<img src="${cover}" alt="${title} cover" class="t-cover" />`
            : '' }
        <div class="t-info">
          <span class="song-title">${title}</span>
          <span class="song-artist">${artist}</span>
        </div>
        ${ preview
            ? `<audio src="${preview}" controls preload="none" class="t-audio"></audio>`
            : `<small>No preview available</small>` }
      `;
      list.appendChild(li);
    });
  } catch (e) {
    console.error('Failed to load trending:', e);
  }
}

window.addEventListener('DOMContentLoaded', loadTrending);