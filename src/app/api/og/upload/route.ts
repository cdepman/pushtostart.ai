import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getSiteBySlug } from "@/lib/db/queries";
import { uploadOgImageToR2 } from "@/lib/cloudflare/r2";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug, image } = await req.json();

  if (!slug || !image || typeof image !== "string") {
    return NextResponse.json({ error: "Missing slug or image" }, { status: 400 });
  }

  // Verify ownership
  const site = await getSiteBySlug(slug);
  if (!site || site.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    await uploadOgImageToR2(slug, imageBuffer);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("OG image upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
