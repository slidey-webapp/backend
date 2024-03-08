import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as CommonService from "./common.service";
import { isValidFile } from "./common.util";
import * as MESSAGE from "../../resource/message";
export const uploadImage = async (req, res, next) => {
    try {
        const user = req.user;
        const file = req.file;
        const valid = isValidFile(file);
        if (!valid.isValid) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.BAD_REQUEST,
                message: valid.message,
            });
        }
        const uploadResult = await CommonService.uploadFile(file);
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Upload ảnh"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};
