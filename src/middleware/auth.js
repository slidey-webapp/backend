import { API_STATUS, APP_HOMEPAGE, APP_LOGO, RESPONSE_CODE } from "../config/contants";
import { getToken } from "../utilities/request";
import passport from "./passport";
import * as MESSAGE from "../resource/message";
import * as PersonService from "../components/person/person.service";
import * as RoleService from "../components/role/role.service";
import { ACCOUNT_STATUS } from "../components/account/account.model";
import { sendEmail } from "../utilities/email";
import { getRoleOfAccount } from "../components/role/role.util";
export const auth = (req, res, next) => {
    return passport.authenticate("normalStrategy", { session: false }, async function (err, account, info) {
        if (account) {
            const token = getToken(req.headers);
            const person = await PersonService.findPerson({
                accountID: account.accountID,
            });

            if (person) {
                if (account.status === ACCOUNT_STATUS.UNVERIFIED) {
                    const verifyURL = `${APP_HOMEPAGE}/api/account/${account.accountID}/verify/${token}`;
                    sendEmail({
                        emailTo: {
                            name: person ? person.fullname : "",
                            address: account.email,
                        },
                        subject: MESSAGE.VERIFY_MAIL_SUBJECT,
                        htmlData: {
                            dir: "/resource/htmlEmailTemplate/verifyEmail.html",
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
                account.hasPassword = !!account.password;
                delete account.password;
                const clone = { ...account };
                Object.keys(clone).forEach((key) => {
                    if (key.includes(".")) {
                        delete account[key];
                    }
                });
                const accountRoles = await getRoleOfAccount({
                    accountID: account.accountID,
                });
                req.user = {
                    ...person,
                    ...account,
                    claims: accountRoles,
                };
                req.token = token;
                next();
            } else {
                return res.status(RESPONSE_CODE.UNAUTHORIZED).json({
                    status: API_STATUS.UNAUTHORIZED,
                    message: MESSAGE.UNAUTHORIZED,
                });
            }
        } else {
            console.log(info);
            if (info && info.name === "TokenExpiredError") {
                return res.status(RESPONSE_CODE.UNAUTHORIZED).json({
                    status: API_STATUS.TOKEN_EXPIRED,
                    message: MESSAGE.UNAUTHORIZED,
                });
            } else {
                return res.status(RESPONSE_CODE.UNAUTHORIZED).json({
                    status: API_STATUS.UNAUTHORIZED,
                    message: MESSAGE.UNAUTHORIZED,
                });
            }
        }
    })(req, res, next);
};
