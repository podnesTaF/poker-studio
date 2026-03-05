import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");

  if (!email) {
    return new NextResponse("Missing email parameter", { status: 400 });
  }

  try {
    await prisma.subscriber.delete({
      where: { email: email.toLowerCase().trim() },
    });
  } catch {
    // Already unsubscribed or doesn't exist
  }

  return new NextResponse(
    `<!DOCTYPE html>
    <html>
      <head><title>Unsubscribed</title></head>
      <body style="background:#09090b;color:#f5f5f0;font-family:system-ui;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;">
        <div style="text-align:center;">
          <h1 style="font-size:24px;font-weight:400;">Unsubscribed</h1>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;">You've been removed from our mailing list.</p>
        </div>
      </body>
    </html>`,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}
