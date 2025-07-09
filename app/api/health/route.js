import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Check environment variables
    const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;
    
    let serviceAccountValid = false;
    let projectId = null;
    
    if (hasServiceAccount) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        serviceAccountValid = !!(parsed.project_id && parsed.private_key && parsed.client_email);
        projectId = parsed.project_id;
      } catch (e) {
        serviceAccountValid = false;
      }
    }
    
    return NextResponse.json({
      status: "ok",
      environment: {
        hasServiceAccount,
        serviceAccountValid,
        projectId,
        nodeEnv: process.env.NODE_ENV,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}