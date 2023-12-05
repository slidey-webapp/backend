import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput } from "../../utilities/api";
import { getPaginationInfo } from "../../utilities/pagination";
import * as PresentationService from "../presentation/presentation.service";
import { SLIDE_TYPE } from "../presentation/slide/slide.model";
import * as SlideService from "../presentation/slide/slide.service";
import { cloneSlides, getDetailSlideOfPresentation, mapSlide } from "../presentation/slide/slide.util";
import { SESSION_STATUS } from "./session.model";
import * as SessionService from "./session.service";

export const startPresentation = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            presentationID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const presentation = await PresentationService.findAccessiblePresentation({
            accountID: user.accountID,
            presentationID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Bản trình bày"),
            });
        }
        const slides = (
            await getDetailSlideOfPresentation({
                presentationID,
            })
        ).map((item) => mapSlide(item));

        const oldSession = await SessionService.findSession({
            presentationID,
        });
        if (oldSession && oldSession.status !== SESSION_STATUS.ENDED) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.IS_PRESENTING,
            });
        }

        const session = await SessionService.createSession({
            presentationID,
            accountID: user.accountID,
            name: presentation.name,
        });

        const sessionPresentation = await PresentationService.createPresentation({
            name: presentation.name,
            accountID: presentation.createdBy,
            code: presentation.code,
            sessionID: session.sessionID,
        });

        await cloneSlides(slides, sessionPresentation.presentationID);

        const sessionSlides = (
            await getDetailSlideOfPresentation({
                presentationID: sessionPresentation.presentationID,
            })
        ).map((item) => mapSlide(item));

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                session: session,
                presentation: {
                    ...sessionPresentation,
                    slides: sessionSlides,
                },
            },
            message: MESSAGE.POST_SUCCESS("Bắt đầu trình chiếu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const joinPresentation = async (req, res, next) => {
    try {
        const user = req.user;
        const { sessionID, name } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            sessionID,
            name,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }

        const session = await SessionService.findSession({
            sessionID,
        });
        if (!session) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("phiên trình chiếu"),
            });
        }

        const oldParticipant = await SessionService.findParticipant({
            sessionID,
            name,
        });
        if (oldParticipant) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.EXISTED,
                message: MESSAGE.EXISTED_PARTICIPANT_NAME,
            });
        }

        const participant = await SessionService.addParticipant({
            accountID: user ? user.accountID : null,
            sessionID: session.sessionID,
            name,
        });

        const presentation = await PresentationService.findPresentation(
            {
                sessionID,
            },
            false
        );

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Tham gia phiên trình chiếu"),
            result: {
                participant,
                presentation,
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

export const getMySession = async (req, res, next) => {
    try {
        const user = req.user;
        const { offset, limit } = getPaginationInfo(req);
        const name = req.query.name;
        const sessions = await SessionService.getUserPresentSession({
            accountID: user.accountID,
            offset,
            limit,
            name,
        });
        const total = await SessionService.countUserPresentSession({
            accountID: user.accountID,
            name,
        });
        const totalParticipant = await Promise.all(
            sessions.map((item) => {
                return SessionService.countSessionParticipant({
                    sessionID: item.sessionID,
                });
            })
        );
        sessions.forEach((item, index) => {
            item.totalParticipant = totalParticipant[index];
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: sessions,
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
            message: MESSAGE.QUERY_SUCCESS("Lịch sử trình chiếu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const submitAnswer = async (req, res, next) => {
    try {
        const { slideID, option, sessionID, participantID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            slideID,
            option,
            sessionID,
            participantID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const [session, presentation, participant] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),
            PresentationService.findPresentation(
                {
                    sessionID,
                },
                false
            ),
            SessionService.findParticipant({
                participantID,
                sessionID,
            }),
        ]);
        if (!session) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("phiên trình chiếu"),
            });
        }
        if (!presentation) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Session"),
            });
        }
        if (!participant) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        const [slide, oldResult] = await Promise.all([
            SlideService.findSlide({
                presentationID: presentation.presentationID,
                slideID,
            }),
            SlideService.findSlideResult({
                participantID,
                slideID,
            }),
        ]);
        if (!slide) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Slide"),
            });
        }
        if (oldResult) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.ALREADY_SUBMIT_ANSWER,
            });
        }
        if (slide.type === SLIDE_TYPE.MULTIPLE_CHOICE) {
            const foundOption = await SlideService.findMultipleChoiceSlideOption({
                option,
            });
            if (!foundOption) {
                return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                    status: API_STATUS.INVALID_INPUT,
                    message: MESSAGE.INVALID_INPUT("Lựa chọn"),
                });
            }
            const slideResult = await SlideService.createSlideResult({
                slideID,
                participantID,
                value: option,
            });
            return res.status(RESPONSE_CODE.SUCCESS).json({
                status: API_STATUS.OK,
                result: slideResult,
                message: MESSAGE.POST_SUCCESS("Gửi câu trả lời"),
            });
        }
        return res.status(RESPONSE_CODE.BAD_REQUEST).json({
            status: API_STATUS.INVALID_INPUT,
            message: MESSAGE.INVALID_INPUT("Slide"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
