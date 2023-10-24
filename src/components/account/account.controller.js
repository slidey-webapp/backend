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
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput } from "../../utilities/api";
import { sendEmail } from "../../utilities/email";
import { mapUser } from "../../utilities/mapUser";
import { validateGoogleToken } from "../../utilities/oauth";
import * as PersonService from "../person/person.service";
import { ACCOUNT_STATUS } from "./account.model";
import * as AccountService from "./account.service";
import { comparePassword } from "./account.util";
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
                errors: emptyInputError,
            });
        }
        if (confirmPassword !== password) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.PASSWORD_NOT_MATCH,
                errors: {
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
                errors: {
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
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                user: mapUser({
                    ...person,
                    ...account,
                }),
                token: token,
                refreshToken,
                claims: [],
            },
            message: MESSAGE.POST_SUCCESS("Tạo tài khoản"),
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
                errors: emptyInputError,
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
                errors: {
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
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.NOT_VERIFIED,
                message: MESSAGE.SEND_VERIFY_EMAIL(account.email),
                result: verifyURL,
            });
        }

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                user: mapUser({
                    ...person,
                    ...account,
                }),
                token: token,
                refreshToken: refreshToken,
                claims: [],
            },
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
                errors: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            accountID,
        });
        if (!account) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
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
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
            });
        }

        await AccountService.verifyAccount({
            accountID,
        });
        const person = await PersonService.findPerson({
            accountID: account.accountID,
        });
        account.status = ACCOUNT_STATUS.ACTIVE;
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                user: mapUser({
                    ...person,
                    ...account,
                }),
            },
            message: MESSAGE.POST_SUCCESS("Xác thực tài khoản"),
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
        const { token: ggToken } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                ggToken,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
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
        const payload = verifiedTokenResponse.payload;
        const account = await AccountService.findAccount({
            email: payload.email,
        });
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
            return res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                result: {
                    user: mapUser({
                        ...person,
                        ...account,
                    }),
                    token: token,
                    refreshToken: refreshToken,
                },
                message: MESSAGE.POST_SUCCESS("Đăng nhập"),
            });
        } else {
            //not found account to login, so signup instead
            const account = await AccountService.createAccount({
                email: payload.email,
                status: ACCOUNT_STATUS.ACTIVE,
            });
            const person = await PersonService.createPerson({
                accountID: account.accountID,
                fullname: payload.name,
            });
            const { token, refreshToken } = await AccountService.createToken(
                {
                    accountID: account.accountID,
                },
                true
            );

            return res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                result: {
                    user: mapUser({
                        ...person,
                        ...account,
                    }),
                    token: token,
                    refreshToken: refreshToken,
                },
                message: MESSAGE.POST_SUCCESS("Đăng kí"),
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
                errors: emptyInputError,
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
                errors: {
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
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Đổi mật khẩu"),
            result: {
                user: mapUser(user),
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const authToken = async (req, res, next) => {
    try {
        const user = req.user;
        const token = req.token;

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                user: user,
                token: token,
                claims: [],
            },
            message: MESSAGE.POST_SUCCESS("Xác thực"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const logout = async (req, res, next) => {
    try {
        const user = req.user;
        const token = req.token;
        await AccountService.deleteToken({
            accountID: user.accountID,
            token,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {},
            message: MESSAGE.POST_SUCCESS("Đăng xuất"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                email,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            email,
        });
        if (!account) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
                status: API_STATUS.NOT_FOUND,
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

        const resetPasswordURL = `${APP_HOMEPAGE}/account/${account.accountID}/reset-password/${token}`;
        await sendEmail({
            emailTo: {
                name: person ? person.fullname : "",
                address: email,
            },
            subject: MESSAGE.RESET_PASSWORD_MAIL_SUBJECT,
            htmlData: {
                dir: "/src/resource/htmlEmailTemplate/resetPassword.html",
                replace: {
                    verifyUrl: resetPasswordURL,
                    appHomePage: APP_HOMEPAGE,
                    logoUrl: APP_LOGO,
                },
            },
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Yêu cầu đặt lại mật khẩu"),
            result: resetPasswordURL,
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const accountID = req.body.accountID;
        const token = req.body.token;
        const password = req.body.password;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                accountID,
                token,
                password,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const account = await AccountService.findAccount({
            accountID,
        });
        if (!account) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
                status: API_STATUS.NOT_FOUND,
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
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
            });
        }
        const hashPassword = await bcrypt.hash(password, BCRYPT_SALT);
        const changeResult = await AccountService.updatePassword({
            accountID,
            newPassword: hashPassword,
        });
        if (!changeResult) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Tài khoản"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Đặt lại mật khẩu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            message: error.message,
        });
    }
};
