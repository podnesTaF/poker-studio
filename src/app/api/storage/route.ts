import { NextRequest, NextResponse } from "next/server";
import { uploadFile, deleteFile, listFiles } from "@/lib/gcs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") ?? undefined;

    const files = await listFiles(prefix);
    return NextResponse.json({ files });
  } catch (error) {
    console.error("GCS list error:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) ?? "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const timestamp = Date.now();
    const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const gcsPath = `${folder}/${timestamp}-${sanitized}`;

    const contentType = file.type || "application/octet-stream";
    const result = await uploadFile(buffer, gcsPath, contentType);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isDev = process.env.NODE_ENV === "development";
    console.error("GCS upload error:", error);

    return NextResponse.json(
      {
        error: "Failed to upload file",
        ...(isDev && { detail: message }),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { gcsPath } = await request.json();

    if (!gcsPath || typeof gcsPath !== "string") {
      return NextResponse.json(
        { error: "gcsPath is required" },
        { status: 400 }
      );
    }

    await deleteFile(gcsPath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GCS delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
