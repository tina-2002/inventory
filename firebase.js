import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyDwwQxthbCjud65t7VEqoaMuApkf_HdHZ0",
    authDomain: "pantry0-1.firebaseapp.com",
    projectId: "pantry0-1",
    storageBucket: "pantry0-1.appspot.com",
    messagingSenderId: "496051546961",
    appId: "1:496051546961:web:45711a66fbf4e3601d0170",
    measurementId: "G-THX5KWC7GM"
    };
// Insert this into .env file with no quotation marks:
// NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
// NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
// NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
// NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
// NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id



const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };