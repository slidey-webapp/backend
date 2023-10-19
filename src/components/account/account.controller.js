import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
    API_STATUS,
    APP_HOMEPAGE,
    APP_LOGO,
    BCRYPT_SALT,
    INPUT_ERROR,
    JWT_KEY,
    RESPONSE_CODE,
} from "../../config/contants";
import { handleEmptyInput } from "../../utilities/api";
import * as MESSAGE from "../../resource/message";
import * as AccountService from "./account.service";
import * as PersonService from "../person/person.service";
import { comparePassword } from "./account.util";
import { ACCOUNT_STATUS } from "./account.model";
import { sendEmail } from "../../utilities/email";
import { validateGoogleToken } from "../../utilities/oauth";
export const signUp = async (req, res, next) => {
    try {
        const { password, email, fullname, confirmPassword } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                password,
                email,
                fullname,
                confirmPassword,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }
        if (confirmPassword !== password) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.PASSWORD_NOT_MATCH,
                inputError: {
                    confirmPassword: INPUT_ERROR.NOT_MATCH,
                },
            });
        }
        const accountByEmail = await AccountService.findAccount({
            email,
        });
        if (accountByEmail) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.EXISTED,
                message: MESSAGE.EXISTED_USER,
                inputError: {
                    email: INPUT_ERROR.EXISTED,
                },
            });
        }
        const hashPassword = await bcrypt.hash(password, BCRYPT_SALT);
        const account = await AccountService.createAccount({
            password: hashPassword,
            email,
        });
        const { token, refreshToken } = await AccountService.createToken(
            {
                accountID: account.accountID,
            },
            true
        );
        const person = await PersonService.createPerson({
            accountID: account.accountID,
            fullname,
        });
        delete account.password;
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            data: [
                {
                    user: {
                        ...person,
                        ...account,
                    },
                    token: token,
                    refreshToken,
                },
            ],
            message: MESSAGE.POST_SUCCESS("Create acccount"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                password,
                email,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            email,
        });
        if (!account) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.NOT_FOUND_ACCOUNT,
            });
        }
        const isCorrectPassword = await comparePassword({
            account,
            password,
        });

        if (!isCorrectPassword) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INCORRECT_PASSWORD,
                inputError: {
                    password: INPUT_ERROR.IN_CORRECT,
                },
            });
        }

        if (account.status === ACCOUNT_STATUS.INACTIVE) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.BLOCKED_ACCOUNT,
            });
        }
        const { token, refreshToken } = await AccountService.createToken(
            {
                accountID: account.accountID,
            },
            true
        );
        const person = await PersonService.findPerson({
            accountID: account.accountID,
        });
        if (account.status === ACCOUNT_STATUS.UNVERIFIED) {
            const verifyURL = `${APP_HOMEPAGE}/account/${account.accountID}/verify/${token}`;
            await sendEmail({
                emailTo: {
                    name: person ? person.fullname : "",
                    address: email,
                },
                subject: MESSAGE.VERIFY_MAIL_SUBJECT,
                htmlData: {
                    dir: "/src/resource/htmlEmailTemplate/verifyEmail.html",
                    replace: {
                        verifyUrl: verifyURL,
                        appHomePage: APP_HOMEPAGE,
                        logoUrl: APP_LOGO,
                    },
                },
            });
            return res.status(401).json({
                status: API_STATUS.NOT_VERIFIED,
                message: MESSAGE.SEND_VERIFY_EMAIL(account.email),
                verifyURL,
            });
        }

        delete account.password;
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            data: [
                {
                    user: {
                        ...person,
                        ...account,
                    },
                    token: token,
                    refreshToken: refreshToken,
                },
            ],
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const accountID = req.body.accountID;
        const token = req.body.token;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                accountID,
                token,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            accountID,
        });
        if (!account) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("account"),
            });
        }
        const data = jwt.verify(token, JWT_KEY);
        if (!data) {
            return res.status(RESPONSE_CODE.UNAUTHORIZED).json({
                status: API_STATUS.UNAUTHORIZED,
                message: MESSAGE.UNAUTHORIZED,
            });
        }
        const accountByToken = await AccountService.findAccountByToken(
            account.accountID,
            token
        );
        if (!accountByToken) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("account"),
            });
        }

        await AccountService.verifyAccount({
            accountID,
        });
        const person = await PersonService.findPerson({
            accountID: account.accountID,
        });
        account.status = ACCOUNT_STATUS.ACTIVE;
        return res.status(200).json({
            status: API_STATUS.OK,
            data: [
                {
                    ...person,
                    ...account,
                },
            ],
            message: MESSAGE.POST_SUCCESS("Verify account"),
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const googleLogin = async (req, res, next) => {
    try {
        const { email, fullname, token: ggToken } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                email,
                fullname,
                ggToken,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }
        //Validate google token
        const verifiedTokenResponse = await validateGoogleToken(ggToken);
        if (verifiedTokenResponse.error) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                message: MESSAGE.INVALID_INPUT("TOKEN"),
                status: API_STATUS.INVALID_INPUT,
                error: verifiedTokenResponse.error,
            });
        }

        const account = await AccountService.findAccount({ email });
        if (account) {
            const { token, refreshToken } = await AccountService.createToken(
                {
                    accountID: account.accountID,
                },
                true
            );
            const person = await PersonService.findPerson({
                accountID: account.accountID,
            });
            return res.status(200).json({
                status: API_STATUS.OK,
                data: [
                    {
                        user: {
                            ...person,
                            ...account,
                        },
                        token: token,
                        refreshToken: refreshToken,
                    },
                ],
                message: MESSAGE.POST_SUCCESS("Login"),
            });
        } else {
            //not found account to login, so signup instead
            const account = await AccountService.createAccount({
                email,
            });
            const person = await PersonService.createPerson({
                accountID: account.accountID,
                fullname,
            });
            const { token, refreshToken } = await AccountService.createToken(
                {
                    accountID: account.accountID,
                },
                true
            );

            res.status(200).json({
                status: API_STATUS.OK,
                data: [
                    {
                        user: {
                            ...person,
                            ...account,
                        },
                        token: token,
                        refreshToken: refreshToken,
                    },
                ],
                message: MESSAGE.POST_SUCCESS("signup"),
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const googleSignup = async (req, res, next) => {
    try {
        const { token: ggToken, email, fullname } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                email,
                fullname,
                ggToken,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }

        //Validate google token
        const verifiedTokenResponse = await validateGoogleToken(ggToken);
        if (verifiedTokenResponse.error) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                message: MESSAGE.INVALID_INPUT("TOKEN"),
                status: API_STATUS.INVALID_INPUT,
                error: verifiedTokenResponse.error,
            });
        }

        const account = await AccountService.findAccount({ email: email });
        if (account) {
            //sign up to an existed email, so login instead
            const person = await PersonService.createPerson({
                accountID: account.accountID,
                fullname,
            });
            const { token, refreshToken } = await AccountService.createToken(
                {
                    accountID: account.accountID,
                },
                true
            );
            return res.status(200).json({
                status: API_STATUS.OK,
                data: [
                    {
                        user: {
                            ...person,
                            ...account,
                        },
                        token: token,
                        refreshToken: refreshToken,
                    },
                ],
                message: MESSAGE.POST_SUCCESS("Login"),
            });
        } else {
            //not found account to login, so signup instead
            const account = await AccountService.createAccount({
                email,
            });
            const person = await PersonService.createPerson({
                accountID: account.accountID,
                fullname,
            });
            const { token, refreshToken } = await AccountService.createToken(
                {
                    accountID: account.accountID,
                },
                true
            );

            res.status(200).json({
                status: API_STATUS.OK,
                data: [
                    {
                        user: {
                            ...person,
                            ...account,
                        },
                        token: token,
                        refreshToken: refreshToken,
                    },
                ],
                message: MESSAGE.POST_SUCCESS("signup"),
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const user = req.user;
        const accountID = user.accountID;
        const { password, newPassword } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                password,
                newPassword,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                inputError: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            accountID,
        });
        const isCorrectPassword = await comparePassword({
            account,
            password,
        });
        if (!isCorrectPassword) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INCORRECT_PASSWORD,
                inputError: {
                    password: INPUT_ERROR.IN_CORRECT,
                },
            });
        }

        const hashPassword = await bcrypt.hash(newPassword, BCRYPT_SALT);
        const changeResult = await AccountService.updatePassword({
            accountID,
            newPassword: hashPassword,
        });
        if (!changeResult) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("account"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Change password"),
            data: [user],
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};
