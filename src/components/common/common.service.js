import { Cloudinary } from "./cloudinary";

export const uploadFile = async (file) => {
    const result = await Cloudinary.upload(file.path);
    const { secure_url, public_id } = result;
    return {
        mediaURL: secure_url,
        publicID: public_id,
    };
};

export const uploadBuffer = async (buffer) => {
    const result = await Cloudinary.uploadBuffer(buffer);
    const { secure_url, public_id } = result;
    return {
        mediaURL: secure_url,
        publicID: public_id,
    };
};

export const destroyFile = async (publicID) => {
    const result = await Cloudinary.destroy(publicID);
    return result;
};
