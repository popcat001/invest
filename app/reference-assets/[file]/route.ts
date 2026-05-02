import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const allowed = new Set([
  "l-dimension-five-layer-capital-allocation.png",
  "lxt-strategy-model-layer-tier-map.png",
  "rewired-signal-rules-traffic-lights.png"
]);

export async function GET(_request: NextRequest, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!allowed.has(file)) return new NextResponse("Not found", { status: 404 });

  const image = await readFile(path.join(process.cwd(), "ref", file));
  return new NextResponse(image, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
