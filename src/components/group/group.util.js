import { GROUP_MEMBER_ROLE } from "./group.models";

export const isValidRole = (role) => {
    return Object.keys(GROUP_MEMBER_ROLE).some((key) => {
        return GROUP_MEMBER_ROLE[key] === role;
    });
};
