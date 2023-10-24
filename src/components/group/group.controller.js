import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput, queryParamToBool } from "../../utilities/api";
import { getPaginationInfo } from "../../utilities/pagination";
import { generateCode } from "../../utilities/string";
import { GROUP_MEMBER_ROLE } from "./group.models";
import * as GroupService from "./group.service";
export const createGroup = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } =
            handleEmptyInput({
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
        const { offset, limit, getTotal } = getPaginationInfo(req);
        const getCounter = queryParamToBool(req.query.getCounter);
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
        let counter = getCounter
            ? {
                  total: await GroupService.countAllGroup(query),
                  totalOwned: await GroupService.countMyGroup(query),
                  totalJoined: await GroupService.countJoinedGroup(query),
              }
            : null;
        if (!groups.length) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Nhóm"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                groups,
                ...(getCounter && counter),
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
