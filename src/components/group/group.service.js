import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import GroupTable, {
    GROUP_MEMBER_ROLE,
    GroupMemberTable,
} from "./group.models";
import { Op } from "../../database";

export const createGroup = async ({ name, code, description, createdBy }) => {
    const newGroup = (
        await GroupTable.create({
            name,
            code,
            description,
            createdBy,
        })
    ).get({
        plain: true,
    });
    return newGroup;
};

export const createGroupMember = async ({ groupID, accountID, role }) => {
    const newGroupMember = (
        await GroupMemberTable.create({
            groupID,
            accountID,
            role,
        })
    ).get({
        plain: true,
    });
    return newGroupMember;
};

export const getListGroup = ({
    accountID,
    offset,
    limit,
    name,
    code,
    getMine,
    getAll,
    getJoined,
}) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return GroupTable.findAll({
        raw: true,
        offset: offset,
        limit: limit,
        order: [["createdAt", "DESC"]],
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            ...(!getAll &&
                getMine && {
                    createdBy: accountID,
                }),
            ...(!getAll &&
                getJoined && {
                    [Op.and]: {
                        "$GroupMembers.accountID$": accountID,
                        "$GroupMembers.role$": [
                            GROUP_MEMBER_ROLE.COOWNER,
                            GROUP_MEMBER_ROLE.MEMBER,
                        ],
                    },
                }),
            ...(getAll && {
                "$GroupMembers.accountID$": accountID,
            }),
        },
        include: {
            model: GroupMemberTable,
            attributes: [],
            as: "GroupMembers",
            duplicating: false,
        },
    });
};

export const findGroup = (data) => {
    return GroupTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const countMyGroup = ({ accountID, name, code }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return GroupTable.count({
        raw: true,
        order: [["createdAt", "DESC"]],
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            createdBy: accountID,
        },
    });
};

export const countJoinedGroup = ({ accountID, name, code }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return GroupTable.count({
        raw: true,
        order: [["createdAt", "DESC"]],
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            "$GroupMembers.accountID$": accountID,
            "$GroupMembers.role$": [
                GROUP_MEMBER_ROLE.COOWNER,
                GROUP_MEMBER_ROLE.MEMBER,
            ],
        },
        include: {
            model: GroupMemberTable,
            attributes: [],
            as: "GroupMembers",
            duplicating: false,
        },
    });
};

export const countAllGroup = ({ accountID, name, code }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchCode = getInsensitiveCaseRegextForSearchLike(code || "");
    return GroupTable.count({
        raw: true,
        order: [["createdAt", "DESC"]],
        where: {
            name: {
                [Op.regexp]: searchName,
            },
            code: {
                [Op.regexp]: searchCode,
            },
            "$GroupMembers.accountID$": accountID,
        },
        include: {
            model: GroupMemberTable,
            attributes: [],
            as: "GroupMembers",
            duplicating: false,
        },
    });
};
