import { getCode } from "../../utilities/string";
import * as GroupService from "../group/group.service";
import { SESSION_STATUS } from "./session.model";
import * as SessionService from "./session.service";

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
    return getCode(isExistedCode, 8);
};
