import * as GroupService from "../group/group.service";

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
