import {
    JWT_KEY,
    REFRESH_TOKEN_EXPIRES_IN,
    TOKEN_EXPIRES_IN,
} from "../../config/contants";
import AccountTable, { ACCOUNT_STATUS } from "./account.model";
import AccountTokenTable, {
    TOKEN_TYPE,
} from "./accountToken/accountToken.model";
import jwt from "jsonwebtoken";

export const findAccount = async (data) => {
    if (data) {
        return AccountTable.findOne({
            raw: true,
            where: {
                ...data,
            },
        });
    }
    return null;
};

export const createAccount = async ({ password, email }) => {
    const newAccount = (
        await AccountTable.create({
            password,
            email: email,
            status: ACCOUNT_STATUS.UNVERIFIED,
        })
    ).get({
        plain: true,
    });
    return newAccount;
};

export const findAccountByToken = (accountID, token) => {
    return AccountTable.findOne({
        where: {
            accountID: accountID,
        },
        include: [
            {
                model: AccountTokenTable,
                where: {
                    token,
                    accountID,
                    type: TOKEN_TYPE.TOKEN,
                },
            },
        ],
        raw: true,
    });
};

export const createToken = async ({ accountID }, getRefreshToken = false) => {
    const result = {};
    const token = jwt.sign({ accountID: accountID }, JWT_KEY, {
        expiresIn: TOKEN_EXPIRES_IN,
    });
    const accountToken = await AccountTokenTable.create({
        accountID,
        token: token,
    });

    result.token = token;
    if (getRefreshToken) {
        const refreshToken = jwt.sign({ accountID: accountID }, JWT_KEY, {
            expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        });
        const accountRefreshToken = await AccountTokenTable.create({
            type: TOKEN_TYPE.REFRESH_TOKEN,
            accountID,
            token: refreshToken,
        });
        result.refreshToken = refreshToken;
    }
    return result;
};

export const updatePassword = async ({ accountID, newPassword }) => {
    const result = await AccountTable.update(
        {
            password: newPassword,
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
