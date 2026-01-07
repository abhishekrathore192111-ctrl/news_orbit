import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBocRap4DuNaSrIhBMQuKocvGqZ338o0hE",
  authDomain: "newsorbit-74b31.firebaseapp.com",
  projectId: "newsorbit-74b31",
  storageBucket: "newsorbit-74b31.appspot.com",
  messagingSenderId: "951404522992",
  appId: "1:951404522992:web:7a033ffa969b8120940135",
  measurementId: "G-2EPCBTFFWT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;