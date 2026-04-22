import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  Unsubscribe,
  doc,
  updateDoc,
  deleteDoc,

} from 'firebase/firestore';

import {setDoc, getDoc, } from 'firebase/firestore';

import { firebaseConfig } from './firebase.config';

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

type UserProfile = {
  name: string;
  email: string;
  budgets: {
    food: number;
    transport: number;
    entertainment: number;
    utilities: number;
    other: number;
  };
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {



  currentUser: any = null;

  private app = initializeApp(firebaseConfig);
  private db = getFirestore(this.app);
  public auth = getAuth(this.app);

  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      console.log('👤 Auth state updated:', user);
    });
  }

  // ---------------- FIRESTORE ----------------

  async addTransaction(data: any) {
    const user = this.currentUser;

    console.log('🔥 currentUser:', user);

    if (!user) {
      console.error('❌ No user found when saving!');
      return;
    }

    const ref = collection(this.db, 'transactions');

    return await addDoc(ref, {
      ...data,
      userId: user.uid
    });
  }

  // REAL-TIME READ (per user)
  getTransactions(callback: (transactions: any[]) => void): Unsubscribe {
    const ref = collection(this.db, 'transactions');

    const unsubscribe = onSnapshot(ref, (snapshot) => {
      const user = this.currentUser;

      if (!user) {
        callback([]);
        return;
      }

      const transactions = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter((t: any) => t.userId === user.uid);

      callback(transactions);
    });

    return unsubscribe;
  }

  // ---------------- UPDATE ----------------

  async updateTransaction(id: string, data: any) {
    const ref = doc(this.db, 'transactions', id);
    return await updateDoc(ref, data);
  }

  // ---------------- DELETE ----------------

  async deleteTransaction(id: string) {
    const ref = doc(this.db, 'transactions', id);
    return await deleteDoc(ref);
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


  async saveUserProfile(data: UserProfile) {
  const user = this.auth.currentUser;

  if (!user) throw new Error('No user');

  const ref = doc(this.db, 'users', user.uid);

  return setDoc(ref, {
    ...data,
    email: user.email
  }, { merge: true });
}

async getUserProfile() {
  const user = this.auth.currentUser;

  if (!user) return null;

  const ref = doc(this.db, 'users', user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return {
      name: '',
      email: user.email || '',
      monthlyBudget: 0
    };
  }

  return snapshot.data();
}

async updateUserProfile(data: any) {
  const user = this.auth.currentUser;

  if (!user) throw new Error('No user');

  const ref = doc(this.db, 'users', user.uid);

  return await updateDoc(ref, data);
}
}