import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

export const CloudinaryFolder = "Slidey";

export const Cloudinary = {
    upload: async (file, folder = CloudinaryFolder) => {
        return await new Promise((resolve) => {
            cloudinary.v2.uploader.upload(
                file,
                {
                    folder: folder,
                },
                (err, callResult) => {
                    resolve({ ...callResult });
                }
            );
        });
    },
    destroy: async (publicId) => {
        return await new Promise((resolve) => {
            cloudinary.v2.uploader.destroy(publicId, (result) => {
                resolve({
                    message: "destroy success",
                });
            });
        });
    },
};
