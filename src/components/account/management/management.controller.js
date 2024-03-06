import { handleEmptyInput } from "../../../utilities/api";
import * as MESSAGE from "../../../resource/message";
import { getPaginationInfo } from "../../../utilities/pagination";
import * as AccountService from "../account.service";
import jwt from "jsonwebtoken";
import { API_STATUS, RESPONSE_CODE } from "../../../config/contants";
export const blockAccount = async (req, res, next) => {
    try {
        const user = req.user;
        const { accountID, reason } = req.body;
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getListAccountCombo = async (req, res, next) => {
    try {
        const user = req.user;
        const acounts = await AccountService.getListAccount({
            limit: 1000,
            offset: 0,
        });
        const result = acounts.map((item) => {
            return {
                value: item.accountID,
                label: item.email,
            };
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: result,
            message: MESSAGE.QUERY_SUCCESS("Tài khoản"),
        });
    } catch (error) {
        console.log("error:", error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
