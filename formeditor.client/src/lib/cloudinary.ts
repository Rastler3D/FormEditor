export const cloudinary = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "rastler3d",
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "image_cloud",
};