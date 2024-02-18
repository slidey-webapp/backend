import { getCode } from "../../utilities/string";
import { GROUP_MEMBER_ROLE } from "./group.models";
import * as GroupService from "./group.service";
export const isValidRole = (role) => {
    return Object.keys(GROUP_MEMBER_ROLE).some((key) => {
        return GROUP_MEMBER_ROLE[key] === role;
    });
};
export const isExistedCode = (code) => {
    return GroupService.findGroup({
        code,
    });
};

export const getGroupCode = async () => {
    return getCode(isExistedCode, 8);
};
