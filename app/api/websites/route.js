import { dbAdmin } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const snapshot = await dbAdmin.collection("websites").get();
    console.log(snapshot);
    const websites = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(websites);
    return NextResponse.json(websites);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch websites" },
      { status: 500 }
    );
  }
}
