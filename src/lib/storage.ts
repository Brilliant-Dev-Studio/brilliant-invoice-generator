import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
export function storageReady() {
  return Boolean(process.env.S3_BUCKET && process.env.AWS_REGION);
}
function s3() {
  if (!storageReady())
    throw new Error(
      "S3 is not configured. Add the bucket and region to enable uploads.",
    );
  return new S3Client({ region: process.env.AWS_REGION });
}
export async function putImage(key: string, body: Buffer) {
  await s3().send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: "image/png",
      ServerSideEncryption: "AES256",
    }),
  );
}
export async function getImage(key: string) {
  const response = await s3().send(
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
  );
  if (!response.Body) throw new Error("Asset not found.");
  return response.Body.transformToByteArray();
}
