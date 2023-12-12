import { findAccountByToken } from "../components/account/account.service";
import { findPerson } from "../components/person/person.service";
import { JWT_KEY } from "../config/contants";
import { getToken } from "../utilities/request";
import jwt from "jsonwebtoken";

export const getMe = async (req, res, next) => {
    const token = getToken(req.headers);
    if (!token) {
        req.user = null;
        next();
    } else {
        try {
            const data = jwt.verify(token, JWT_KEY);
            const account = await findAccountByToken(data.accountID, token);
            if (!account) {
                req.user = null;
            } else {
                const person = await findPerson({
                    accountID: account.accountID,
                });
                delete account.password;
                const clone = { ...account };
                Object.keys(clone).forEach((key) => {
                    if (key.includes(".")) {
                        delete account[key];
                    }
                });
                req.user = {
                    ...person,
                    ...account,
                };
                req.token = token;
            }
        } catch (error) {
            console.log(error);
            req.user = null;
        }
        next();
    }
};
