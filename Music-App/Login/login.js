import { auth } from "./firebaseConfig.js";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

const loginBox  = document.getElementById("loginContainer");
const signBox   = document.getElementById("registrationContainer");
const toSignup  = document.getElementById("toSignup");
const toLogin   = document.getElementById("toLogin");

toSignup.addEventListener("click", (e) => {
  e.preventDefault();          
  loginBox.classList.add("hidden");
  signBox.classList.remove("hidden");
});

toLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signBox.classList.add("hidden");
  loginBox.classList.remove("hidden");
});


// Sign in with Google 
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const btnGoogleLogin  = document.getElementById("googleLoginBtn");
const btnGoogleSignup = document.getElementById("googleSignupBtn");

async function handleGoogleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Google Sign in Successfully:", result.user);
    // Redirect to home page after sign in
    window.location.href = "../Home/music.html";
  } catch (err) {
    console.error("Google sign in error:", err);
    alert("Google sign in failed, Please try again.");
  }
}

btnGoogleLogin.addEventListener("click",  handleGoogleSignIn);
btnGoogleSignup.addEventListener("click", handleGoogleSignIn);

//  Email/Password Sign-In
const loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    // Redirect to home page on successful sign‑in
    window.location.href = "../Home/music.html";
  } catch (error) {
    console.error("Email sign-in error:", error);
    if (error.code === "auth/user-not-found") {
      alert("No account found with this email. Please sign up first.");
    } else if (error.code === "auth/wrong-password") {
      alert("Incorrect password. Please try again.");
    } else {
      alert("Sign-in failed: " + error.message);
    }
  }
});

//  Email/Password Sign-Up 
const signupForm = document.getElementById("signupForm");
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    // Redirect to home page on successful registration
    window.location.href = "../Home/music.html";
  } catch (error) {
    console.error("Email sign-up error:", error);
    if (error.code === "auth/email-already-in-use") {
      alert("This email is already registered. Please sign in instead.");
    } else if (error.code === "auth/invalid-email") {
      alert("Invalid email address. Please check and try again.");
    } else if (error.code === "auth/weak-password") {
      alert("Password too weak. It must be at least 6 characters.");
    } else {
      alert("Registration failed: " + error.message);
    }
  }
});