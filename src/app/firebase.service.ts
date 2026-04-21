import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';
import {  onAuthStateChanged } from 'firebase/auth';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  currentUser: any = null;

  private app = initializeApp(firebaseConfig);
  private db = getFirestore(this.app);
  public auth = getAuth(this.app);

  constructor() {
  const auth = getAuth(this.app);

  onAuthStateChanged(auth, (user) => {
    this.currentUser = user;
    console.log("👤 Auth state updated:", user);
  });
}

  // ---------------- FIRESTORE ----------------

async addTransaction(data: any) {

  const auth = getAuth(this.app);
  const user = auth.currentUser;

  console.log("🔥 currentUser:", user);

  if (!user) {
    console.error("❌ No user found when saving!");
    return;
  }

  const ref = collection(this.db, 'transactions');

  return await addDoc(ref, {
    ...data,
    userId: user.uid
  });
}

  getTransactions(callback: (transactions: any[]) => void): Unsubscribe {
    const ref = collection(this.db, 'transactions');

    // Set up real-time listener
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      // Get current user at the time of the snapshot
      const auth = getAuth(this.app);
      const user = auth.currentUser;

      if (!user) {
        callback([]);
        return;
      }

      const transactions = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((transaction: any) => transaction.userId === user.uid);

      callback(transactions);
    });

    return unsubscribe;
  }

  // ---------------- AUTH ----------------

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  getCurrentUser() {
  return this.auth.currentUser;
}
}