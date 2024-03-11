import * as MESSAGE from "../../resource/message";
const _15MB = 1024 * 1024 * 15;

export const isValidFile = (file) => {
    if (!file || !file.mimetype.match(/image.*/)) return { isValid: false, message: MESSAGE.IMAGE_ONLY };
    if (file.size > _15MB) return { isValid: false, message: MESSAGE.FILE_TOO_BIG };
    return { isValid: true };
};
