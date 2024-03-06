import { handleEmptyInput } from "../../../utilities/api";
import * as MESSAGE from "../../../resource/message";
import { getPaginationInfo } from "../../../utilities/pagination";
import * as AccountService from "../account.service";
import { API_STATUS, RESPONSE_CODE } from "../../../config/contants";
import { mapUserWithFullname } from "../../../utilities/mapUser";
import { getRoleOfAccount } from "../../role/role.util";

export const blockAccount = async (req, res, next) => {
    try {
        const { accountID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            accountID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }

        const account = await AccountService.changeAccountBlock({
            isBlocked: true,
            accountID,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                account,
            },
            message: MESSAGE.POST_SUCCESS("Khóa tài khoản"),
        });
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
        const accounts = await AccountService.getListAccount({
            limit: 1000,
            offset: 0,
        });
        const result = accounts.map((item) => {
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

export const getListAccount = async (req, res, next) => {
    try {
        const { offset, limit } = getPaginationInfo(req);
        const fullname = req.query.fullname;
        const email = req.query.email;

        const accounts = await AccountService.getListAccount({
            limit: limit,
            offset: offset,
            fullname,
            email,
        });

        const total = await AccountService.countAccount({
            fullname,
            email,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: accounts.map(mapUserWithFullname) || [],
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
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

export const unblockAccount = async (req, res, next) => {
    try {
        const { accountID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            accountID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const account = await AccountService.changeAccountBlock({
            isBlocked: false,
            accountID,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                account,
            },
            message: MESSAGE.POST_SUCCESS("Mở khóa tài khoản"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
