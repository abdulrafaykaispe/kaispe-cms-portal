import { NextResponse } from "next/server";
import { doc, getDoc, updateDoc } from "firebase-admin/firestore";
import { dbAdmin } from "@/app/lib/firebaseAdmin";

export async function GET(request, { params }) {
  try {
    if (!dbAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { id, section } = params;
    const websiteDoc = dbAdmin.collection("websites").doc(id);
    const websiteSnapshot = await websiteDoc.get();

    if (!websiteSnapshot.exists) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteData = websiteSnapshot.data();

    // Handle nested section paths (e.g., "homePage.sectionOne")
    const sectionPath = section.split(".");
    let sectionData = websiteData;

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
    if (!dbAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { id, section } = params;
    const { data } = await request.json();

    console.log("Updating section:", { id, section, data });

    const websiteDoc = dbAdmin.collection("websites").doc(id);
    const websiteSnapshot = await websiteDoc.get();

    if (!websiteSnapshot.exists) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteData = websiteSnapshot.data();
    console.log("Current website data:", websiteData);

    const updatedData = { ...websiteData };
    console.log("Initial data:", updatedData);

    // Handle nested section paths (e.g., "homePage.sectionOne")
    const sectionPath = section.split(".");
    console.log("Section path:", sectionPath);

    let current = updatedData;

    // Navigate to the parent of the target section
    for (let i = 0; i < sectionPath.length - 1; i++) {
      if (!current[sectionPath[i]]) {
        current[sectionPath[i]] = {};
      }
      current = current[sectionPath[i]];
      console.log(`Navigated to level ${i + 1}:`, current);
    }

    // Set the final section data
    const finalKey = sectionPath[sectionPath.length - 1];
    console.log("Setting final key:", finalKey, "with data:", data);
    current[finalKey] = data;

    console.log("Final updated data:", JSON.stringify(updatedData, null, 2));
    // Update the document
    await websiteDoc.update(updatedData);

    console.log("Document updated successfully");
    return NextResponse.json({
      success: true,
      section: section,
      data: data,
    });
  } catch (error) {
    console.error("Error updating section:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    if (!dbAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { id, section } = params;
    const { data } = await request.json();

    const websiteDoc = dbAdmin.collection("websites").doc(id);
    const websiteSnapshot = await websiteDoc.get();

    if (!websiteSnapshot.exists) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // Add new section using dot notation
    const updateData = {
      [section]: data,
      lastUpdated: new Date(),
    };

    await websiteDoc.update(updateData);

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
    if (!dbAdmin) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const { id, section } = params;

    const websiteDoc = dbAdmin.collection("websites").doc(id);
    const websiteSnapshot = await websiteDoc.get();

    if (!websiteSnapshot.exists) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    const websiteData = websiteSnapshot.data();
    const sectionPath = section.split(".");

    // Create a deep copy of data and remove the section
    const updatedData = JSON.parse(JSON.stringify(websiteData || {}));
    let current = updatedData;

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

    await websiteDoc.update(updatedData);

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
