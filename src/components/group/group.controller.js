import {
    API_STATUS,
    APP_HOMEPAGE,
    APP_LOGO,
    GROUP_SECRET_KEY,
    INPUT_ERROR,
    RESPONSE_CODE,
    TOKEN_EXPIRES_IN,
} from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput, queryParamToBool } from "../../utilities/api";
import { sendEmail } from "../../utilities/email";
import { mapGroupMember } from "../../utilities/mapUser";
import { getPaginationInfo } from "../../utilities/pagination";
import { generateCode } from "../../utilities/string";
import { GROUP_MEMBER_ROLE } from "./group.models";
import * as GroupService from "./group.service";
import jwt from "jsonwebtoken";
import { isValidRole } from "./group.util";

export const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            name,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const user = req.user;
        const oldGroup = await GroupService.findGroup({
            name,
        });
        if (oldGroup) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.EXISTED,
                message: MESSAGE.EXISTED_PRESENTATION,
            });
        }
        const group = await GroupService.createGroup({
            name,
            description,
            createdBy: user.accountID,
            code: generateCode(),
        });

        await GroupService.createGroupMember({
            groupID: group.groupID,
            accountID: user.accountID,
            role: GROUP_MEMBER_ROLE.OWNER,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: group,
            message: MESSAGE.POST_SUCCESS("Tạo nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getListGroup = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset, limit } = getPaginationInfo(req);
        const getMine = queryParamToBool(req.query.getMine);
        const getJoined = queryParamToBool(req.query.getJoined);
        const getAll = getMine === getJoined;
        const groupName = req.query.name;
        const groupCode = req.query.code;
        const query = {
            name: groupName,
            code: groupCode,
            accountID: user.accountID,
        };
        const groups = await GroupService.getListGroup({
            ...query,
            offset,
            limit,
            getAll,
            getJoined,
            getMine,
        });
        let total = 0;
        if (getAll) {
            total = await GroupService.countAllGroup(query);
        } else if (getMine) {
            total = await GroupService.countMyGroup(query);
        } else if (getJoined) {
            total = await GroupService.countJoinedGroup(query);
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: groups || [],
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
            message: MESSAGE.QUERY_SUCCESS("Nhóm"),
        });
    } catch (error) {
        console.log("error:", error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const sendInviteEmail = async (req, res, next) => {
    try {
        const user = req.user;
        const { email, groupID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            email,
            groupID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const group = await GroupService.findGroup({
            groupID,
        });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        const token = jwt.sign(
            {
                groupID: groupID,
                email,
            },
            GROUP_SECRET_KEY,
            { expiresIn: TOKEN_EXPIRES_IN }
        );
        const inviteURL = `${APP_HOMEPAGE}/group/join/${token}`;
        sendEmail({
            emailTo: {
                address: email,
                name: "",
            },
            subject: MESSAGE.GROUP_INVITATION_MAIL_SUBJECT,
            htmlData: {
                dir: "/src/resource/htmlEmailTemplate/groupInvitation.html",
                replace: {
                    inviteURL,
                    appHomePage: APP_HOMEPAGE,
                    logoUrl: APP_LOGO,
                    groupName: group.name,
                    sender: user.fullname,
                },
            },
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Gửi lời mời tham gia nhóm"),
            result: inviteURL,
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const joinGroup = async (req, res, next) => {
    try {
        const user = req.user;
        const { token } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            token,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const data = jwt.verify(token, GROUP_SECRET_KEY);
        if (!data) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Token"),
            });
        }
        const groupID = data.groupID;
        const email = data.email;
        if (!groupID || !email) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Token"),
            });
        }

        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        // Nếu email của user khác với email trong lời mời thì báo lỗi
        if (email !== user.email) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const oldGroupMember = await GroupService.findGroupMember({
            accountID: user.accountID,
            groupID,
        });
        if (!oldGroupMember) {
            const newGroupMember = await GroupService.createGroupMember({
                groupID,
                accountID: user.accountID,
                role: GROUP_MEMBER_ROLE.MEMBER,
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Tham gia nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getGroupMember = async (req, res, next) => {
    try {
        const { offset, limit, getTotal } = getPaginationInfo(req);
        const groupID = req.query.groupID;
        const name = req.query.name;
        const email = req.query.email;
        const members = await GroupService.getGroupMember({
            groupID,
            offset,
            limit,
            name,
            email,
        });
        const total = getTotal
            ? await GroupService.countGroupMember({
                  groupID,
                  name,
                  email,
              })
            : 0;
        if (!members || !members.length) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                result: [],
                message: MESSAGE.QUERY_NOT_FOUND("Thành viên nhóm"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                members: members.map((item) => mapGroupMember(item)),
                ...(getTotal && { total }),
            },
            message: MESSAGE.QUERY_SUCCESS("Thành viên nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getGroupDetail = async (req, res, next) => {
    try {
        const { groupID } = req.query;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            groupID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                group,
            },
            message: MESSAGE.QUERY_SUCCESS("Nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const removeGroupMember = async (req, res, next) => {
    try {
        const user = req.user;
        const { groupID, accountID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            groupID,
            accountID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        if (parseFloat(accountID) === user.accountID) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.OK,
                message: MESSAGE.CANT_REMOVE_YOURSELF,
                errors: {
                    accountID: INPUT_ERROR.INVALID,
                },
            });
        }
        const myRole = await GroupService.findGroupMember({
            accountID: user.accountID,
            groupID: groupID,
        });
        if (!myRole || myRole.role !== GROUP_MEMBER_ROLE.OWNER) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        await GroupService.removeGroupMember({
            accountID,
            groupID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa thành viên khỏi nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const updateGroupMemberRole = async (req, res, next) => {
    try {
        const user = req.user;
        const { groupID, accountID, role } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            groupID,
            accountID,
            role,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        if (!isValidRole(role) || role === GROUP_MEMBER_ROLE.OWNER) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Vai trò"),
                errors: {
                    role: INPUT_ERROR.INVALID,
                },
            });
        }
        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        const myRole = await GroupService.findGroupMember({
            accountID: user.accountID,
            groupID,
        });
        if (!myRole || myRole.role === GROUP_MEMBER_ROLE.MEMBER) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }

        await GroupService.updateGroupMemberRole({
            groupID,
            accountID,
            role,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Cập nhật vai trò của thành viên"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const leaveGroup = async (req, res, next) => {
    try {
        const user = req.user;
        const { groupID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            groupID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        const myRole = await GroupService.findGroupMember({
            accountID: user.accountID,
            groupID,
        });
        if (!myRole) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
            });
        }
        await GroupService.removeGroupMember({
            groupID,
            accountID: user.accountID,
        });
        if (myRole.role === GROUP_MEMBER_ROLE.OWNER) {
            const coowner = await GroupService.findGroup({
                groupID,
                role: GROUP_MEMBER_ROLE.COOWNER,
            });
            if (coowner) {
                await GroupService.updateGroupMemberRole({
                    groupID,
                    accountID: coowner.accountID,
                    role: GROUP_MEMBER_ROLE.OWNER,
                });
            } else {
                const member = await GroupService.findGroup({
                    groupID,
                    role: GROUP_MEMBER_ROLE.MEMBER,
                });
                if (member) {
                    await GroupService.updateGroupMemberRole({
                        groupID,
                        accountID: member.accountID,
                        role: GROUP_MEMBER_ROLE.OWNER,
                    });
                } else {
                    await GroupService.deleteGroup({
                        groupID,
                    });
                }
            }
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Rời nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const deleteGroup = async (req, res, next) => {
    try {
        const user = req.user;
        const { groupID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            groupID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const group = await GroupService.findGroup({ groupID });
        if (!group) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        const myRole = await GroupService.findGroupMember({
            accountID: user.accountID,
            groupID,
        });
        if (!myRole || myRole.role !== GROUP_MEMBER_ROLE.OWNER) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        await GroupService.removeAllGroupMember({ groupID });
        await GroupService.deleteGroup({ groupID });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa nhóm"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
