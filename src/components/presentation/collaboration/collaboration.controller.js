import {
    API_STATUS,
    APP_HOMEPAGE,
    APP_LOGO,
    PRESENTATION_SECRET_KEY,
    RESPONSE_CODE,
    TOKEN_EXPIRES_IN,
} from "../../../config/contants";
import { handleEmptyInput } from "../../../utilities/api";
import * as CollabService from "./collaboration.service";
import * as MESSAGE from "../../../resource/message";
import * as PresentationService from "../presentation.service";
import { getPaginationInfo } from "../../../utilities/pagination";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../../utilities/email";
import { mapCollaborator } from "../../../utilities/mapUser";

export const getCollabs = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset, limit } = getPaginationInfo(req);
        const { name, presentationID } = req.query;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                presentationID,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const collabs = await CollabService.getCollaborator({
            presentationID,
            name,
            offset,
            limit,
        });
        const total = await CollabService.countCollaborator({
            presentationID,
            name,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: collabs.map((item) => mapCollaborator(item)),
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
            message: MESSAGE.QUERY_SUCCESS("Người cộng tác"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const joinCollab = async (req, res, next) => {
    try {
        const user = req.user;
        const { token } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                token,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const data = jwt.verify(token, PRESENTATION_SECRET_KEY);
        if (!data) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Token"),
            });
        }
        const presentationID = data.presentationID;
        const email = data.email;
        if (!presentationID || !email) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Token"),
            });
        }
        const presentation = await PresentationService.findPresentation({
            presentationID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        if (email !== user.email) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        if (presentation.createdBy === user.accountID) {
            return res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                message: MESSAGE.POST_SUCCESS("Tham gia cộng tác"),
            });
        }
        const oldCollab = await CollabService.findCollaborator({
            accountID: user.accountID,
            presentationID,
        });
        if (!oldCollab) {
            await CollabService.addCollaborator({
                presentationID,
                accountID: user.accountID,
            });
        }
        const collab = await CollabService.findCollaborator({
            presentationID,
            accountID: user.accountID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: mapCollaborator(collab),
            message: MESSAGE.POST_SUCCESS("Tham gia cộng tác"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const removeCollab = async (req, res, next) => {
    try {
        const user = req.user;
        const { accountID, presentationID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                presentationID,
                accountID,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const presentation = await PresentationService.findPresentation({
            createdBy: user.accountID,
            presentationID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        await CollabService.removeCollaborator({
            presentationID,
            accountID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa người cộng tác"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const sendInviteEmail = async (req, res, next) => {
    try {
        const user = req.user;
        const { email, presentationID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
                email,
                presentationID,
            });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        if (email === user.email) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.CANT_SEND_INVITATION_TO_YOURSELF,
            });
        }
        const presentation = await PresentationService.findPresentation({
            presentationID,
            createdBy: user.accountID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const token = jwt.sign(
            {
                presentationID: presentationID,
                email,
            },
            PRESENTATION_SECRET_KEY,
            { expiresIn: TOKEN_EXPIRES_IN }
        );
        const inviteURL = `${APP_HOMEPAGE}/presentation/collab/join/${token}`;
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
                    presentation: presentation.name,
                    sender: user.fullname,
                },
            },
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS(
                "Gửi lời mời tham gia chỉnh sửa bản trình bày"
            ),
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
