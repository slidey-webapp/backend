import { API_STATUS, RESPONSE_CODE } from "../config/contants";
import * as MESSAGE from "../resource/message";

export const validateEmptyPassword = (req, res, next) => {
    try {
        const user = req.user;
        if (!user.password) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                message: MESSAGE.PERMISSION_NOT_FOUND,
                status: API_STATUS.PERMISSION_DENIED,
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
