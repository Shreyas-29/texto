// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
    getAuth,
    initializeAuth,
    // @ts-ignore
    getReactNativePersistence
} from 'firebase/auth';
import { collection, getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDlEJhurMXkW6320hDrc2WF5912SRkYTno",
    authDomain: "mediafire-b67df.firebaseapp.com",
    databaseURL: "https://mediafire-b67df-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "mediafire-b67df",
    storageBucket: "mediafire-b67df.appspot.com",
    messagingSenderId: "711783895952",
    appId: "1:711783895952:web:0708763a767871324f1915",
    measurementId: "G-8HEQW76DX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const db = getFirestore(app);

const storage = getStorage(app);

const userRef = collection(db, 'users');
const roomRef = collection(db, 'rooms');

export { auth, db, storage, userRef, roomRef };

