import { v2 as cloudinary } from 'cloudinary'

export const uploadToCloudinary = (file) => {
    cloudinary.uploader
  .upload(file)
  .then(result=>console.log(result));
}