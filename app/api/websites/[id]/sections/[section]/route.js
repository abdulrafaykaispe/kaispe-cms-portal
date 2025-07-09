import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { dbAdmin } from "@/app/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    const { id, section } = params;
    const websiteDoc = doc(dbAdmin, "websites", id);
    const websiteSnapshot = await getDoc(websiteDoc);

    if (!websiteSnapshot.exists()) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteData = websiteSnapshot.data();

    // Handle nested section paths (e.g., "homePage.sectionOne")
    const sectionPath = section.split(".");
    let sectionData = websiteData.allData;

    for (const path of sectionPath) {
      if (sectionData && sectionData[path]) {
        sectionData = sectionData[path];
      } else {
        return NextResponse.json(
          { error: "Section not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      section: section,
      data: sectionData,
    });
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id, section } = params;
    const { data } = await request.json();

    const websiteDoc = doc(dbAdmin, "websites", id);
    const websiteSnapshot = await getDoc(websiteDoc);

    if (!websiteSnapshot.exists()) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Update the nested section using dot notation within allData
    const updatePath = `allData.${section}`;
    const updateData = {
      [updatePath]: data,
      lastUpdated: new Date(),
    };

    await updateDoc(websiteDoc, updateData);

    return NextResponse.json({
      success: true,
      section: section,
      data: data,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { id, section } = params;
    const { data } = await request.json();

    const websiteDoc = doc(dbAdmin, "websites", id);
    const websiteSnapshot = await getDoc(websiteDoc);

    if (!websiteSnapshot.exists()) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Add new section using dot notation within allData
    const updatePath = `allData.${section}`;
    const updateData = {
      [updatePath]: data,
      lastUpdated: new Date(),
    };

    await updateDoc(websiteDoc, updateData);

    return NextResponse.json({
      success: true,
      section: section,
      data: data,
    });
  } catch (error) {
    console.error("Error adding section:", error);
    return NextResponse.json(
      { error: "Failed to add section" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id, section } = params;

    const websiteDoc = doc(dbAdmin, "websites", id);
    const websiteSnapshot = await getDoc(websiteDoc);

    if (!websiteSnapshot.exists()) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteData = websiteSnapshot.data();
    const sectionPath = section.split(".");

    // Create a deep copy of allData and remove the section
    const updatedAllData = JSON.parse(
      JSON.stringify(websiteData.allData || {})
    );
    let current = updatedAllData;

    // Navigate to parent
    for (let i = 0; i < sectionPath.length - 1; i++) {
      if (current[sectionPath[i]]) {
        current = current[sectionPath[i]];
      } else {
        return NextResponse.json(
          { error: "Section path not found" },
          { status: 404 }
        );
      }
    }

    // Delete the final key
    const finalKey = sectionPath[sectionPath.length - 1];
    if (current[finalKey]) {
      delete current[finalKey];
    } else {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    await updateDoc(websiteDoc, {
      allData: updatedAllData,
      lastUpdated: new Date(),
    });

    return NextResponse.json({
      success: true,
      section: section,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}
