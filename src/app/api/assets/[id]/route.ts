import { requireUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { getImage } from "@/lib/storage";
import sharp from "sharp";
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  const asset = await one<{ objectKey: string; purpose: string }>(
    "SELECT objectKey, purpose FROM assets WHERE id=$1 AND companyId=$2",
    (await params).id,
    user.companyId,
  );
  if (!asset)
    return Response.json({ error: "Asset not found" }, { status: 404 });
  try {
    const bytes = await getImage(asset.objectKey);
    let image = Buffer.from(bytes);
    if (
      asset.purpose === "signature" &&
      new URL(request.url).searchParams.get("fit") === "ink"
    ) {
      // Remove unused signature-canvas space without changing the stored original.
      image = await sharp(image, { limitInputPixels: 16_000_000 })
        .flatten({ background: "#ffffff" })
        .png()
        .toBuffer();
      image = await sharp(image)
        .trim({ background: "#ffffff", threshold: 10, lineArt: true })
        .extend({ top: 8, bottom: 8, left: 8, right: 8, background: "#ffffff" })
        .png()
        .toBuffer();
      // Resample the cropped ink for consistent PDF and high-density previews.
      // This smooths small originals; it cannot recreate missing stroke detail.
      image = await sharp(image)
        .resize({
          width: 1200,
          height: 600,
          fit: "inside",
          kernel: "lanczos3",
          withoutReduction: true,
        })
        .png()
        .toBuffer();
    }
    return new Response(image, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "Asset is temporarily unavailable" },
      { status: 503 },
    );
  }
}
