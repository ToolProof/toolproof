import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyA_os5LBdfVO_IexfqpfiTeYUoOPMP68UU',
    authDomain: 'toolproof-563fe.firebaseapp.com',
    projectId: 'toolproof-563fe',
    storageBucket: 'toolproof-563fe.appspot.com',
    messagingSenderId: '384484325421',
    appId: '1:384484325421:web:820785323cc2b5b1d9a0a4',
    measurementId: 'G-TSXX163NNS'
};
// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig); // if already initialized, use that one
const db = getFirestore(app);
export { db };
