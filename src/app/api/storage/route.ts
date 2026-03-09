import { NextRequest, NextResponse } from "next/server";
import { generateSignedUploadUrl, deleteFile, listFiles } from "@/lib/gcs";

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

/**
 * Returns a GCS V4 signed URL so the client can PUT the file directly to GCS,
 * bypassing Vercel's 4.5 MB request-body limit.
 */
export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, folder } = (await request.json()) as {
      fileName?: string;
      contentType?: string;
      folder?: string;
    };

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: "fileName and contentType are required" },
        { status: 400 }
      );
    }

    const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const gcsPath = `${folder ?? "uploads"}/${Date.now()}-${sanitized}`;

    const result = await generateSignedUploadUrl(gcsPath, contentType);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isDev = process.env.NODE_ENV === "development";
    console.error("GCS signed-url error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
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
