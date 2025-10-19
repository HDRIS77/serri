// Firebase Configuration Placeholder
// Replace with your actual Firebase project config from Firebase Console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firestore Rules Example (add to Firebase Console > Firestore > Rules):
// rules_version = '2';
// service cloud.firestore {
//   match /databases/{database}/documents {
//     match /posts/{postId} {
//       allow read: if true; // Anonymous read
//       allow write: if request.auth != null && request.auth.uid == resource.data.userId;
//       match /comments/{commentId} {
//         allow read, write: if request.auth != null && request.auth.uid == get(/databases/$(database)/documents/posts/$(postId)).data.userId;
//       }
//     }
//     match /users/{userId} {
//       allow read, write: if request.auth != null && request.auth.uid == userId;
//       match /messages/{messageId} {
//         allow read: if request.auth != null && request.auth.uid == userId;
//         allow write: if true; // Anonymous write
//       }
//     }
//     match /blocks/{blockId} {
//       allow read, write: if request.auth != null;
//     }
//   }
// }