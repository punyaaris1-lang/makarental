// src/firebase.js
// Firebase v12 modular API (ESM)

// --- IMPORT FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyAk3G5aQUBVe_g7_peVu1F6xllP_RejGq0",
  authDomain: "rtomaka-e67b5.firebaseapp.com",
  projectId: "rtomaka-e67b5",
  storageBucket: "rtomaka-e67b5.firebasestorage.app",
  messagingSenderId: "472036722228",
  appId: "1:472036722228:web:11d520f9204db317d02c61"
};

// --- INIT FIREBASE ---
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// ===============================
// AUTH FUNCTIONS
// ===============================

// Login admin/user
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Register admin/user (opsional)
export function register(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Logout
export function logout() {
  return signOut(auth);
}

// Listener: apakah user sudah login?
export function onAuth(cb) {
  return onAuthStateChanged(auth, cb);
}

// ===============================
// FIRESTORE CRUD HELPERS
// ===============================

// Tambah data (auto ID)
export function addData(col, data) {
  return addDoc(collection(db, col), {
    ...data,
    createdAt: serverTimestamp()
  });
}

// Set dokumen dengan ID tertentu
export function setData(col, id, data) {
  return setDoc(doc(db, col, id), data, { merge: true });
}

// Ambil semua data dalam collection
export async function getAll(col) {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Ambil satu dokumen
export async function getOne(col, id) {
  const ref = doc(db, col, id);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Query: where
export async function getWhere(col, field, operator, value) {
  const q = query(collection(db, col), where(field, operator, value));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Hapus dokumen
export function remove(col, id) {
  return deleteDoc(doc(db, col, id));
}

// Listener real-time
export function listen(col, cb) {
  return onSnapshot(collection(db, col), (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(data);
  });
}
