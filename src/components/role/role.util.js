import { getCode } from "../../utilities/string";
import { getFullAccountInfo } from "../account/account.util";
import * as RoleService from "./role.service";
export const isExistedCode = (code) => {
    return RoleService.findRole({
        code,
    });
};

export const getRoleCode = async () => {
    return getCode(isExistedCode, 8);
};

export const getAccountInfoOfRole = async ({ roleID }, user) => {
    const accountRoles = await RoleService.getAccountRoleOfRole({ roleID });
    const accountInfo = await Promise.all(
        accountRoles.map((item) =>
            getFullAccountInfo(
                {
                    accountID: item.accountID,
                },
                user
            )
        )
    );
    return accountRoles.map((item, index) => {
        return {
            ...accountInfo[index],
            ...item,
        };
    });
};
