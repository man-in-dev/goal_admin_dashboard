import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || "",
  },
  forcePathStyle: false, // DigitalOcean Spaces requires this to be false for custom endpoints
});

export default s3Client;
