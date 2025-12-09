// src/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore, collection, doc, getDoc, getDocs,
  addDoc, setDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAk3G5aQUBVe_g7_peVu1F6xllP_RejGq0",
  authDomain: "rtomaka-e67b5.firebaseapp.com",
  projectId: "rtomaka-e67b5",
  storageBucket: "rtomaka-e67b5.firebasestorage.app",
  messagingSenderId: "472036722228",
  appId: "1:472036722228:web:11d520f9204db317d02c61"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// AUTH helpers
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}
export function logout() {
  return signOut(auth);
}
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// FIRESTORE helpers
export function addData(col, data) {
  return addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
}
export function setData(col, id, data) {
  return setDoc(doc(db, col, id), data, { merge: true });
}
export async function getAll(col) {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export async function getOne(col, id) {
  const snap = await getDoc(doc(db, col, id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getWhere(col, field, operator, value) {
  const q = query(collection(db, col), where(field, operator, value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
export function remove(col, id) {
  return deleteDoc(doc(db, col, id));
}
export function listen(col, cb) {
  return onSnapshot(collection(db, col), (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
