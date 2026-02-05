// frontend-react/src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

// --------------------------------------------------------
// TODO: Ensure your keys are pasted here correctly!
// --------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCah1R9qd_2HnvEn0st7rerTs80b8yUD6g",
  authDomain: "careerarchitect-c2be8.firebaseapp.com",
  projectId: "careerarchitect-c2be8",
  storageBucket: "careerarchitect-c2be8.firebasestorage.app",
  messagingSenderId: "483023683406",
  appId: "1:483023683406:web:fa91e36f044d12db00a81f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Helper Functions (These were missing!) ---

// 1. Google Sign In
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// 2. Email Sign Up
export const signUpWithEmail = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// 3. Email Sign In
export const signInWithEmail = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// 4. Logout
export const logout = () => {
  return signOut(auth);
};

// 5. Auth State Listener (renaming onAuthStateChanged to match your import)
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };