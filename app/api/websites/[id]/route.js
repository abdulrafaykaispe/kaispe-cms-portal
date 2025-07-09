import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { dbAdmin } from "@/app/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    console.log("Fetching website with ID:", params.id);
    
    const { id } = params;
    
    if (!id) {
      console.error("No ID provided");
      return NextResponse.json({ error: "Website ID is required" }, { status: 400 });
    }
    
    console.log("Creating document reference for:", id);
    const websiteDoc = doc(dbAdmin, "websites", id);
    
    console.log("Fetching document...");
    const websiteSnapshot = await getDoc(websiteDoc);
    
    console.log("Document exists:", websiteSnapshot.exists());

    if (!websiteSnapshot.exists()) {
      console.log("Website not found for ID:", id);
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const data = websiteSnapshot.data();
    console.log("Website data retrieved:", data);
    
    const website = {
      id: websiteSnapshot.id,
      ...data,
    };

    console.log("Returning website:", website);
    return NextResponse.json({ website });
  } catch (error) {
    console.error("Error fetching website:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to fetch website", details: error.message },
      { status: 500 }
    );
  }
}
