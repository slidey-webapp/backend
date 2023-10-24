import { models } from "../../database";
const GroupTable = models.Group;
export default GroupTable;
export const GroupMemberTable = models.GroupMember;
export const GROUP_MEMBER_ROLE = {
    OWNER: "OWNER",
    COOWNER: "COOWNER",
    MEMBER: "MEMBER",
};
