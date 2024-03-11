import { API_STATUS, RESPONSE_CODE } from "../config/contants";

import * as MESSAGE from "../resource/message";

export const isAdminOnlyPath = ["/api/account/management/unblock", "/api/account/management/block"];

export const AdminRole = "System.Admin";

export const roleCheck = (req, res, next) => {
    const path = req.originalUrl;
    const user = req.user;
    if (isAdminOnlyPath.includes(path)) {
        if (user && user.claims.find((item) => item.code === AdminRole)) {
            next();
            return;
        }
        return res.status(RESPONSE_CODE.FORBIDDEN).json({
            status: API_STATUS.PERMISSION_DENIED,
            message: MESSAGE.PERMISSION_NOT_FOUND,
        });
    }
    next();
};
