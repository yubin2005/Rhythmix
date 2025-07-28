import { auth } from "./firebaseConfig.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const loginContainer   = document.getElementById("loginContainer");
const registrationContainer = document.getElementById("registrationContainer");
const resetContainer   = document.getElementById("resetContainer");
const forgotLink       = document.getElementById("forgotLink");
const backToLogin      = document.getElementById("backToLogin");
const resetForm        = document.getElementById("resetForm");
const resetEmailInput  = document.getElementById("resetEmail");
const resetMessage     = document.getElementById("resetMessage");

// Show reset panel
forgotLink.addEventListener("click", e => {
  e.preventDefault();
  loginContainer.classList.add("hidden");
  registrationContainer.classList.add("hidden");
  resetContainer.classList.remove("hidden");
  resetMessage.textContent = "";
  resetForm.reset();
});

//  Back to login
backToLogin.addEventListener("click", e => {
  e.preventDefault();
  resetContainer.classList.add("hidden");
  loginContainer.classList.remove("hidden");
});

//  Handle reset form
resetForm.addEventListener("submit", async e => {
  e.preventDefault();
  resetMessage.textContent = "";
  const email = resetEmailInput.value.trim();

  try {
    await sendPasswordResetEmail(auth, email);
    resetMessage.style.color = "#27ae60";  // green
    resetMessage.textContent = "✅ Reset link sent! Check your inbox.";
  } catch (err) {
    console.error("Reset error", err);
    resetMessage.style.color = "#e74c3c";  // red
    if (err.code === "auth/user-not-found") {
      resetMessage.textContent = "No account found with that email.";
    } else if (err.code === "auth/invalid-email") {
      resetMessage.textContent = "Invalid email address.";
    } else {
      resetMessage.textContent = "Error sending email. Please try again later.";
    }
  }
});