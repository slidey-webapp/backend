import * as MESSAGE from "../../resource/message";
const _5MB = 1024 * 1024 * 5;

export const isValidFile = (file) => {
    if (!file || !file.mimetype.match(/image.*/)) return { isValid: false, message: MESSAGE.IMAGE_ONLY };
    if (file.size > _5MB) return { isValid: false, message: MESSAGE.FILE_TOO_BIG };
    return { isValid: true };
};
