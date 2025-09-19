import axios from "axios";

export const uploadToCloudinary = async (
  file: File
): Promise<string | null> => {
  try {
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      console.error("File too large for upload:", file.name, "Size:", file.size);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "goal_institute");
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhlxxn6o8'}/image/upload`,
      formData
    );

    return res.data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    return null;
  }
};

export const uploadVideoToCloudinary = async (
  file: File
): Promise<string | null> => {
  try {
    // Check file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      console.error("Video file too large for upload:", file.name, "Size:", file.size);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "goal_institute");
    formData.append("resource_type", "video");
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dhlxxn6o8'}/video/upload`,
      formData
    );

    return res.data.secure_url;
  } catch (error) {
    console.error("Error uploading video to Cloudinary:", error);
    return null;
  }
};
