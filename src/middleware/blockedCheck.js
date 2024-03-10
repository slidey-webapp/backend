import { API_STATUS, RESPONSE_CODE } from "../config/contants";

import * as MESSAGE from "../resource/message";

export const blockedCheck = (req, res, next) => {
    const user = req.user;
    if (user && user.isBlocked) {
        return res.status(RESPONSE_CODE.FORBIDDEN).json({
            status: API_STATUS.PERMISSION_DENIED,
            message: MESSAGE.BLOCKED_ACCOUNT,
        });
    }
    next();
};
