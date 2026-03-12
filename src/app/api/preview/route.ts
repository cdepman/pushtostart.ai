import { NextRequest, NextResponse } from "next/server";
import { detectArtifactType, detectsAiUsage } from "@/lib/artifact/detect";
import { wrapArtifact } from "@/lib/artifact/wrap";
import { MAX_CODE_LENGTH } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sourceCode, title } = body;

  if (!sourceCode) {
    return NextResponse.json(
      { error: "sourceCode is required" },
      { status: 400 }
    );
  }

  if (sourceCode.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: `Code is too large (max ${MAX_CODE_LENGTH / 1000}KB)` },
      { status: 400 }
    );
  }

  const artifactType = detectArtifactType(sourceCode);
  const usesAi = detectsAiUsage(sourceCode);
  const html = wrapArtifact(sourceCode, artifactType, {
    title: title || "Preview",
    slug: "preview",
  }, { usesAi });

  return NextResponse.json({ html, artifactType });
}
