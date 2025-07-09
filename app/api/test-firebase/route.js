import { NextResponse } from "next/server";
import { dbAdmin } from "@/app/lib/firebaseAdmin";

export async function GET() {
  try {
    console.log("Testing Firebase connection...");
    
    // Try to get a simple collection reference
    const testCollection = dbAdmin.collection("websites");
    console.log("Collection reference created successfully");
    
    // Try to get documents
    const snapshot = await testCollection.limit(1).get();
    console.log("Query executed successfully, docs count:", snapshot.size);
    
    return NextResponse.json({ 
      success: true, 
      message: "Firebase connection working",
      docsCount: snapshot.size 
    });
  } catch (error) {
    console.error("Firebase connection test failed:", error);
    return NextResponse.json(
      { 
        error: "Firebase connection failed", 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}