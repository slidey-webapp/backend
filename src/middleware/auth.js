import { API_STATUS, RESPONSE_CODE } from "../config/contants";
import { getToken } from "../utilities/request";
import passport from "./passport";
import * as MESSAGE from "../resource/message";
import * as PersonService from "../components/person/person.service";
export const auth = (req, res, next) => {
    return passport.authenticate(
        "normalStrategy",
        { session: false },
        async function (err, account, info) {
            if (account) {
                const person = await PersonService.findPerson({
                    accountID: account.accountID,
                });
                if (person) {
                    req.user = {
                        ...person,
                        ...account,
                    };
                    req.token = getToken(req.headers);
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
        }
    )(req, res, next);
};
