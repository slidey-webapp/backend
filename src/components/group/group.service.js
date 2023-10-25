import { getInsensitiveCaseRegextForSearchLike } from "../../utilities/string";
import GroupTable, {
    GROUP_MEMBER_ROLE,
    GroupMemberTable,
} from "./group.models";
import { Op } from "../../database";
import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "../../config/contants";
import AccountTable from "../account/account.model";
import PersonTable from "../person/person.model";

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
        offset: offset || DEFAULT_OFFSET,
        limit: limit || DEFAULT_LIMIT,
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

export const findGroupMember = (data) => {
    return GroupMemberTable.findOne({
        raw: true,
        where: {
            ...data,
        },
    });
};

export const getGroupMember = ({ groupID, offset, limit, name, email }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchEmail = getInsensitiveCaseRegextForSearchLike(email || "");
    return GroupMemberTable.findAll({
        raw: true,
        offset: offset || DEFAULT_OFFSET,
        limit: limit || DEFAULT_LIMIT,
        order: [["createdAt", "DESC"]],
        where: {
            groupID,
            "$Accounts.email$": {
                [Op.regexp]: searchName,
            },
            "$Persons.fullname$": {
                [Op.regexp]: searchEmail,
            },
        },
        include: [
            {
                model: AccountTable,
                attributes: ["email"],
                as: "Accounts",
                duplicating: false,
            },
            {
                model: PersonTable,
                attributes: ["fullname"],
                as: "Persons",
                duplicating: false,
            },
        ],
    });
};

export const countGroupMember = ({ groupID, name, email }) => {
    const searchName = getInsensitiveCaseRegextForSearchLike(name || "");
    const searchEmail = getInsensitiveCaseRegextForSearchLike(email || "");
    return GroupMemberTable.count({
        raw: true,
        where: {
            groupID,
            "$Accounts.email$": {
                [Op.regexp]: searchName,
            },
            "$Persons.fullname$": {
                [Op.regexp]: searchEmail,
            },
        },
        include: [
            {
                model: AccountTable,
                attributes: ["email"],
                as: "Accounts",
                duplicating: false,
            },
            {
                model: PersonTable,
                attributes: ["fullname"],
                as: "Persons",
                duplicating: false,
            },
        ],
    });
};

export const removeGroupMember = ({ groupID, accountID }) => {
    return GroupMemberTable.destroy({
        where: {
            groupID,
            accountID,
        },
    });
};

export const updateGroupMemberRole = async ({ groupID, accountID, role }) => {
    const result = await GroupMemberTable.update(
        {
            role,
        },
        {
            where: {
                groupID,
                accountID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};
