import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "gallery",
      width: 150,
      crop: "scale",
      resource_type: "auto",
    });

    console.log('Upload result:', result);
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
