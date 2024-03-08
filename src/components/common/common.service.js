import { Cloudinary } from "./cloudinary";

export const uploadFile = async (file) => {
    const result = await Cloudinary.upload(file.path);
    const { secure_url, public_id } = result;
    return {
        assetURL: secure_url,
        assetID: public_id,
    };
};
