import * as PresentationService from "./presentation.service";
import * as SlideService from "./slide/slide.service";

import * as MESSAGE from "../../resource/message";
import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import { handleEmptyInput } from "../../utilities/api";
import { generateCode } from "../../utilities/string";
import { SLIDE_TYPE } from "./slide/slide.model";
import { getPaginationInfo } from "../../utilities/pagination";
import { deleteSlideReference } from "./slide/slide.util";

export const createPresentation = async (req, res, next) => {
    try {
        const { name } = req.body;
        const user = req.user;
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
        const oldPresentation = await PresentationService.findPresentation({
            name,
        });
        if (oldPresentation) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.EXISTED,
                message: MESSAGE.EXISTED_PRESENTATION,
            });
        }

        const newPresentation = await PresentationService.createPresentation({
            name,
            accountID: user.accountID,
            code: generateCode(),
        });
        const firstSlide = await SlideService.createSlide({
            presentationID: newPresentation.presentationID,
            slideOrder: 1,
            type: SLIDE_TYPE.HEADING,
        });
        const headingSlide = await SlideService.createHeadingSlide({
            slideID: firstSlide.slideID,
            heading: "",
            subHeading: "",
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Tạo bản trình bày"),
            result: {
                presentation: newPresentation,
                slides: [
                    {
                        ...firstSlide,
                        ...headingSlide,
                    },
                ],
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getMyPresentations = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset, limit, getTotal } = getPaginationInfo(req);
        const presentations = await PresentationService.getUserPresentation({
            createdBy: user.accountID,
            offset,
            limit,
        });
        let total = null;
        if (getTotal) {
            total = await PresentationService.countPresentation({
                createdBy: user.accountID,
            });
        }
        if (!presentations || !presentations.length) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                result: {},
                message: MESSAGE.QUERY_NOT_FOUND("Bản trình bày"),
            });
        }
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                presentations: presentations,
                ...(getTotal ? { total } : {}),
            },
            message: MESSAGE.QUERY_SUCCESS("Bản trình bày"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const deletePresentation = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID } = req.body;
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
        const presentation = await PresentationService.findPresentation({
            presentationID,
            createdBy: user.accountID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Bản trình bày"),
            });
        }
        await PresentationService.updatePresentation({
            presentationID,
            currentSlideID: null,
        });
        const slides = SlideService.getSlideOfPresentation({ presentationID });
        const promises = slides.map((slide) =>
            deleteSlideReference({ slideID: slide.slideID, type: slide.type })
        );
        await Promise.all(promises);
        await SlideService.deleteSlideOfPresentation({
            presentationID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Xóa bản trình bày"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
