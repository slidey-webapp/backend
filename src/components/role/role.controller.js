import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput } from "../../utilities/api";
import { getAccountInfoOfRole, getRoleCode } from "./role.util";
import * as RoleService from "./role.service";
import { getPaginationInfo } from "../../utilities/pagination";
import * as AccountService from "../account/account.service";

export const createNewRole = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, code } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            name,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const oldRole = await RoleService.findRole({
            code,
        });
        if (oldRole) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.EXISTED,
                message: MESSAGE.EXISTED_ROLE,
            });
        }
        const role = await RoleService.createRole({
            name,
            code,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: role,
            message: MESSAGE.POST_SUCCESS("Tạo quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getRoleList = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset, limit } = getPaginationInfo(req);
        const name = req.query.name;
        const code = req.query.code;
        const roles = await RoleService.getRoleList({
            name,
            code,
            offset,
            limit,
        });

        const total = await RoleService.countRoleList({
            name,
            code,
        });
        const accountList = await Promise.all(
            roles.map((item) =>
                getAccountInfoOfRole(
                    {
                        roleID: item.roleID,
                    },
                    user
                )
            )
        );
        roles.forEach((item, index) => {
            item.accountRoles = accountList[index];
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: roles || [],
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
            message: MESSAGE.QUERY_SUCCESS("quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getRoleDetail = async (req, res, next) => {
    try {
        const user = req.user;
        const roleID = req.query.roleID;
        const code = req.query.code;
        const role = await RoleService.findRole({
            roleID,
            ...(code && { code }),
        });

        if (!role) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("quyền"),
            });
        }
        const accountRoles = await getAccountInfoOfRole(
            {
                roleID: role.roleID,
            },
            user
        );

        role.accountRoles = accountRoles;
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: role,
            message: MESSAGE.QUERY_SUCCESS("quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, roleID, used } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            name,
            roleID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const role = await RoleService.findRole({
            roleID,
        });
        if (!role) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("quyền"),
            });
        }
        const newRole = await RoleService.updateRole({
            roleID,
            used,
            name,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: newRole,
            message: MESSAGE.POST_SUCCESS("Cập nhật quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const deleteRole = async (req, res, next) => {
    try {
        const user = req.user;
        const { roleID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            roleID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        await RoleService.deleteAccountRole({
            roleID,
        });
        await RoleService.deleteRole({ roleID });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const addRoleToAccount = async (req, res, next) => {
    try {
        const user = req.user;
        const { roleID, accountIDs } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            roleID,
            accountIDs,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const accounts = await Promise.all(
            (accountIDs || []).map((item) => AccountService.findAccount({ accountID: item }))
        );
        const invalidAccountIDs = [];
        accounts.forEach((item, index) => {
            if (!item) {
                invalidAccountIDs.push(accountIDs[index]);
            }
        });
        if (invalidAccountIDs.length) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.QUERY_NOT_FOUND("accountID"),
                errors: {
                    accountIDs: invalidAccountIDs,
                },
            });
        }
        const currentAccountRoles = await RoleService.getAccountRoleOfRole({
            roleID,
        });
        const isDeletedAccountIDs = [];
        const isNewAccountIDs = [];
        currentAccountRoles.forEach((item) => {
            if (!accountIDs.includes(item.accountID)) {
                isDeletedAccountIDs.push(item.accountID);
            }
        });

        accountIDs.forEach((item) => {
            if (!currentAccountRoles.find((role) => role.accountID === item)) {
                isNewAccountIDs.push(item);
            }
        });

        const results = await Promise.all(
            isNewAccountIDs.map((item) => {
                return RoleService.createAccountRole({
                    accountID: item,
                    roleID,
                });
            })
        );
        await Promise.all(
            isDeletedAccountIDs.map((item) => {
                return RoleService.deleteAccountRole({
                    accountID: item,
                    roleID,
                });
            })
        );
        const accountRoles = await getAccountInfoOfRole(
            {
                roleID: roleID,
            },
            user
        );

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: accountRoles,
            message: MESSAGE.POST_SUCCESS("Thêm quyền cho tài khoản"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const deleteRoleOfACcount = async (req, res, next) => {
    try {
        const user = req.user;
        const { accountRoleID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            accountRoleID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        await RoleService.deleteAccountRole({
            accountRoleID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa quyền"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
