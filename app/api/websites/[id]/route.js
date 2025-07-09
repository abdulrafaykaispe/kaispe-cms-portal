import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { dbAdmin } from "@/app/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const websiteDoc = doc(dbAdmin, "websites", id);
    const websiteSnapshot = await getDoc(websiteDoc);

    if (!websiteSnapshot.exists()) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const website = {
      id: websiteSnapshot.id,
      ...websiteSnapshot.data(),
    };

    return NextResponse.json({ website });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch website" },
      { status: 500 }
    );
  }
}
