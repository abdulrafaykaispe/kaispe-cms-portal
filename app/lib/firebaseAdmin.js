import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let dbAdmin;

try {
  let app;
  
  if (!getApps().length) {
    console.log("Initializing Firebase Admin...");
    
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set");
    }
    
    let parsedServiceAccount;
    try {
      parsedServiceAccount = JSON.parse(serviceAccount);
    } catch (parseError) {
      console.error("Failed to parse service account JSON:", parseError);
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT JSON: " + parseError.message);
    }
    
    // Validate required fields
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    for (const field of requiredFields) {
      if (!parsedServiceAccount[field]) {
        throw new Error(`Missing required field in service account: ${field}`);
      }
    }
    
    app = initializeApp({
      credential: cert(parsedServiceAccount),
    });
    
    console.log("Firebase Admin initialized successfully for project:", parsedServiceAccount.project_id);
  } else {
    app = getApps()[0];
    console.log("Using existing Firebase Admin app");
  }
  
  dbAdmin = getFirestore(app);
  console.log("Firestore instance created successfully");
  
} catch (error) {
  console.error("Critical error initializing Firebase Admin:", error);
  throw error;
}

export { dbAdmin };