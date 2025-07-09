import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let app;
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
    }
    
    let parsedServiceAccount;
    try {
      parsedServiceAccount = JSON.parse(serviceAccount);
    } catch (parseError) {
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + parseError.message);
    }
    
    app = initializeApp({
      credential: cert(parsedServiceAccount),
    });
    
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
} else {
  app = getApps()[0];
}

export const dbAdmin = getFirestore(app);
