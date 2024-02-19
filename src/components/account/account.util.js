import bcrypt from "bcryptjs";
import * as AccountService from "./account.service";
import * as PersonService from "../person/person.service";
import { mapUser } from "../../utilities/mapUser";
export const comparePassword = async ({ account, password }) => {
    if (account) {
        const isPasswordMatch = await bcrypt.compare(password, account.password);
        return isPasswordMatch;
    }
    return false;
};

export const getFullAccountInfo = async ({ accountID }, user) => {
    if (accountID === user.accountID) {
        return user;
    }
    const [account, person] = await Promise.all([
        AccountService.findAccount({
            accountID,
        }),
        PersonService.findPerson({
            accountID,
        }),
    ]);
    if (!account || !person) {
        return null;
    }
    return mapUser({
        ...account,
        ...person,
    });
};
