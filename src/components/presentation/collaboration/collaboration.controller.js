import { API_STATUS, RESPONSE_CODE } from "../../../config/contants";
import { handleEmptyInput } from "../../../utilities/api";
import * as CollabService from "./collaboration.service";
import * as MESSAGE from "../../../resource/message";
import * as PresentationService from "../presentation.service";
import { getPaginationInfo } from "../../../utilities/pagination";

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
        const total = await CollabService.countPresentation({
            accountID: user.accountID,
            name,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: collabs,
                totalCount: total,
                totalPages: Math.floor(total / limit) + 1,
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

export const addCollab = async (req, res, next) => {
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
        await CollabService.addCollaborator({
            presentationID,
            accountID,
        });
        const collab = await CollabService.getCollaboratorByID({
            presentationID,
            accountID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: collab,
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
        const oldCollab = await CollabService.findCollaborator({
            presentationID,
            accountID,
        });
        if (!oldCollab) {
            return res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                result: oldCollab,
                message: MESSAGE.QUERY_SUCCESS("Người cộng tác"),
            });
        }
        await CollabService.addCollaborator({
            presentationID,
            accountID,
        });
        const collab = await CollabService.findCollaborator({
            presentationID,
            accountID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: collab,
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
