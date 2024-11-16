import * as admin from "firebase-admin";

let firebaseApp: admin.app.App;

if (!admin.apps.length) {
  firebaseApp = admin.initializeApp();
} else {
  firebaseApp = admin.app(); // Reutiliza o app existente
}

export const firestore = firebaseApp.firestore();
export const storage = firebaseApp.storage();
export const auth = firebaseApp.auth();
