import { v2 as cloudinary } from 'cloudinary';

export const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gallery", resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        console.log('Upload result:', result);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
