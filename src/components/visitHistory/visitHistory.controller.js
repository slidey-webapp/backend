import { API_STATUS, INPUT_ERROR, RESPONSE_CODE } from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput } from "../../utilities/api";
import { getPaginationInfo } from "../../utilities/pagination";
import { ASSET_TYPE } from "./visitHistory.model";
import * as VisitHistoryService from "./visitHistory.service";
import * as PresentationService from "../presentation/presentation.service";
import * as GroupService from "../group/group.service";
import * as SessionService from "../session/session.service";
import { getDetailSlideOfPresentation } from "../presentation/slide/slide.util";
const LIMIT = 20;
export const getMyHistory = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset } = getPaginationInfo(req);
        const histories = await VisitHistoryService.getAccountHistory({
            accountID: user.accountID,
            offset,
            limit: LIMIT,
        });
        const assetPromise = histories.map((item) => {
            if (item.assetType === ASSET_TYPE.PRESENTATION) {
                return new Promise((resolve) => {
                    PresentationService.findPresentation({
                        presentationID: item.assetID,
                    })
                        .then((presentation) => {
                            if (presentation) {
                                getDetailSlideOfPresentation({
                                    presentationID: presentation.presentationID,
                                    offset: 0,
                                    limit: 1,
                                })
                                    .then((slides) => {
                                        if (slides.length) {
                                            presentation.firstSlide = slides[0];
                                        }
                                        resolve(presentation);
                                    })
                                    .catch((error) => {
                                        resolve(null);
                                    });
                            } else {
                                resolve(null);
                            }
                        })
                        .catch((error) => {
                            resolve(null);
                        });
                });
            } else if (item.assetType === ASSET_TYPE.GROUP) {
                // Do nothing
                return new Promise((resolve) => resolve(null));
            } else if (item.assetType === ASSET_TYPE.SESSION) {
                // Do nothing
                return new Promise((resolve) => resolve(null));
            }
        });
        const assets = await Promise.all(assetPromise);
        histories.forEach((item, index) => {
            if (assets[index]) {
                item.asset = assets[index];
            } else {
                item.asset = null;
            }
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: histories,
                totalCount: histories.length,
                currentPage: 1,
                totalPages: 1,
                offset: 0,
                limit: LIMIT,
            },
            message: MESSAGE.QUERY_SUCCESS("Lịch sử truy cập"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const visitAsset = async (req, res, next) => {
    try {
        const user = req.user;
        const { assetID, assetType } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            assetID,
            assetType,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        if (
            !Object.keys(ASSET_TYPE).find((key) => {
                return ASSET_TYPE[key] === assetType;
            })
        ) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("assetType"),
                errors: {
                    assetType: INPUT_ERROR.INVALID,
                },
            });
        }
        let history = await VisitHistoryService.findHistory({
            accountID: user.accountID,
            assetID,
            assetType,
        });
        if (!history) {
            history = await VisitHistoryService.createHistory({
                accountID: user.accountID,
                assetID,
                assetType,
            });
        } else {
            history = await VisitHistoryService.updateHistory({
                accountID: user.accountID,
                assetID,
                assetType,
            });
            history = history[0] || null;
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: history,
            message: MESSAGE.POST_SUCCESS("truy cập"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
