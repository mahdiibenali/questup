import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function generateSignedUploadUrl(userId: string) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `users/${userId}/proofs`;

  const paramsToSign = {
    timestamp,
    folder,
    upload_preset: "levelup_proofs",
    allowed_formats: "jpg,jpeg,png,mp4,mov",
    max_file_size: 10485760, // 10MB
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    params: {
      ...paramsToSign,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
    },
  };
}

export { cloudinary };
