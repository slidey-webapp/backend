import { generateCode } from "../../utilities/string";
import * as GroupService from "../group/group.service";
import { SESSION_STATUS } from "./session.model";
import * as SessionService from "./session.service";

const MAX = 10000;

export const joinableSession = async (session, user) => {
    if (!session.groupID) {
        return true;
    }
    if (!user) {
        return false;
    }
    const groupMember = await GroupService.findGroupMember({
        groupID: session.groupID,
        accountID: user.accountID,
    });
    return !!groupMember;
};

export const isExistedCode = (code) => {
    return SessionService.findSession({
        code,
        status: SESSION_STATUS.STARTED,
    });
};

export const getSessionCode = async () => {
    let code = generateCode(8);
    let i = 0;
    while (i < MAX) {
        const isFound = await isExistedCode(code);
        if (!isFound) {
            return code;
        }
        i++;
        code = generateCode(8);
    }
    return null;
};
