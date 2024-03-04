import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "../../config/contants";
import { Op } from "../../database";
import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import RoleTable, { AccountRoleTable } from "./role.model";

export const createRole = async ({ name, code, used }) => {
    const newAccount = (
        await RoleTable.create({
            name,
            code,
            used: used || false,
        })
    ).get({
        plain: true,
    });
    return newAccount;
};

export const findRole = (data) => {
    return RoleTable.findOne({
        where: {
            ...data,
        },
        raw: true,
    });
};

export const updateRole = async ({ name, roleID, used }) => {
    const result = await RoleTable.update(
        {
            name: name,
            ...(used !== undefined && {
                used,
            }),
        },
        {
            where: {
                roleID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const deleteRole = async ({ roleID }) => {
    return RoleTable.destroy({
        where: {
            roleID,
        },
    });
};

export const getRoleList = async ({ name, used, offset, limit, code }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return RoleTable.findAll({
        raw: true,
        offset: offset || DEFAULT_OFFSET,
        limit: limit || DEFAULT_LIMIT,
        order: [["createdAt", "DESC"]],
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            ...(used !== undefined && {
                used,
            }),
        },
    });
};

export const countRoleList = async ({ name, used, code }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return RoleTable.count({
        raw: true,
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            ...(used !== undefined && {
                used,
            }),
        },
    });
};

export const createAccountRole = async ({ accountID, roleID }) => {
    const newAccount = (
        await AccountRoleTable.create({
            accountID,
            roleID,
        })
    ).get({
        plain: true,
    });
    return newAccount;
};

export const findAccountRole = (data) => {
    return AccountRoleTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const getAccountRoleOfAccount = ({ accountID }) => {
    return AccountRoleTable.findAll({
        raw: true,
        where: {
            accountID,
        },
    });
};

export const getAccountRoleOfRole = ({ roleID }) => {
    return AccountRoleTable.findAll({
        raw: true,
        where: {
            roleID,
        },
    });
};

export const deleteAccountRole = ({ accountID, roleID, accountRoleID }) => {
    return AccountRoleTable.destroy({
        where: {
            ...(accountID && {
                accountID,
            }),
            ...(roleID && {
                roleID,
            }),
            ...(accountRoleID && {
                accountRoleID,
            }),
        },
    });
};

export const updateAccountRole = async ({ accountID, roleID }) => {
    const result = await AccountRoleTable.update(
        {
            roleID: roleID,
        },
        {
            where: {
                accountID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};
