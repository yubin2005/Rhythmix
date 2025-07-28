import { auth } from "../Login/firebaseConfig.js";             
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const input = document.getElementById('file-upload');
const listEl = document.getElementById('file-list');

document.addEventListener('DOMContentLoaded', renderList);

onAuthStateChanged(auth, user => {
  if (!user) {
    listEl.innerHTML = `
      <li>
        <a href="../Login/login.html" class="login-link">Please log in / sign up to manage your library.</a>
      </li>`;
    input.disabled = true;  
  } else {
    input.disabled = false;
    renderList();           
  }
});


input.addEventListener('change', async () => {
  if (!auth.currentUser) {
    return window.location.href = '../Login/login.html';
  }

  const files = [...input.files].filter(f => f.type.startsWith('audio/'));
  
  if (!files.length) {
    return alert('Select an audio file.');
  }

  const form = new FormData();
  files.forEach(origFile => {
    const safeName = encodeURIComponent(origFile.name);
    const fileForUpload = new File([origFile], safeName, { type: origFile.type });
    form.append('songs', fileForUpload, safeName);
  });

  try {
    const res = await fetch('http://localhost:3000/upload', {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
      throw new Error(await res.text());
    }

    const { files: uploaded } = await res.json();   // [{displayName,url,filename},…]
    const lib = JSON.parse(localStorage.getItem('myLibrary') || '[]');
    localStorage.setItem('myLibrary', JSON.stringify([...lib, ...uploaded]));
    renderList();
  } catch (err) {
    console.error(err);
    alert('Upload error: ' + err.message);
  }
});

function renderList() {
  const lib = JSON.parse(localStorage.getItem('myLibrary') || '[]');
  listEl.innerHTML = '';

  lib.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'file-item';
    li.innerHTML = `
      <span class="file-name">${item.displayName || item.name}</span>
      <button class="remove-btn heart">&hearts;</button>
    `;

    // Play track
    li.querySelector('.file-name').addEventListener('click', () => {
      localStorage.setItem('currentTrack', idx);
      sessionStorage.setItem('playOnLoad', 'true');
      window.location.href = '../Home/music.html';
    });

    // Remove track
    li.querySelector('.remove-btn').addEventListener('click', async e => {
      e.stopPropagation();

      if (item.filename) {
        try {
          const resp = await fetch('http://localhost:3000/upload', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: item.filename })
          });

          if (!resp.ok) {
            throw new Error(await resp.text());
          }

        } catch (err) {
          console.error('Server delete failed:', err);
          alert('Warning: failed to delete file on server.');
        }
      }

      // Update list
      lib.splice(idx, 1);
      const cur = Number(localStorage.getItem('currentTrack') || 0);
      if (idx === cur) localStorage.removeItem('currentTrack');
      else if (idx < cur) localStorage.setItem('currentTrack', cur - 1);

      localStorage.setItem('myLibrary', JSON.stringify(lib));
      renderList();
    });

    listEl.appendChild(li);
  });
}