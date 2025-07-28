import { auth } from './firebaseConfig.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';

const authLink = document.getElementById('authLink');

onAuthStateChanged(auth, user => {

  authLink.style.visibility = 'visible';

  if (user) {
    // User is signed in: show “Sign Out”
    authLink.textContent = 'SIGN OUT';
    authLink.href = '#';
    authLink.onclick = async e => {
      e.preventDefault();
      await signOut(auth);
      localStorage.removeItem("currentTrack");
    };
  } else {
    // No user: show “Log In / Sign Up”
    authLink.textContent = 'LOG IN / SIGN UP';
    authLink.href = '../Login/login.html';
    authLink.onclick = null;
  }
});
