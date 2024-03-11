import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

export const CloudinaryFolder = "Slidey";

export const Cloudinary = {
    upload: async (file, folder = CloudinaryFolder) => {
        return await new Promise((resolve) => {
            cloudinary.uploader.upload(
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
    destroy: async (publicID) => {
        return await new Promise((resolve) => {
            cloudinary.uploader.destroy(publicID, (result) => {
                resolve({
                    message: "destroy success",
                });
            });
        });
    },
};
