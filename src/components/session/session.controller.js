import { API_STATUS, RESPONSE_CODE } from "../../config/contants";
import * as MESSAGE from "../../resource/message";
import { handleEmptyInput, queryParamToBool } from "../../utilities/api";
import { getPaginationInfo } from "../../utilities/pagination";
import * as PresentationService from "../presentation/presentation.service";
import { SLIDE_TYPE } from "../presentation/slide/slide.model";
import * as SlideService from "../presentation/slide/slide.service";
import { cloneSlides, getDetailSlideOfPresentation, mapSlide } from "../presentation/slide/slide.util";
import { SESSION_STATUS } from "./session.model";
import * as SessionService from "./session.service";
import * as MessageService from "./message/message.service";
import * as QuestionService from "./question/question.service";
import { mapMessage } from "./message/message.util";
import { joinableSession } from "./session.util";

export const startPresentation = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID, groupID } = req.body;
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
            groupID: groupID || null,
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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
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
        const user = req.user;
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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
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

export const sendMessage = async (req, res, next) => {
    try {
        const user = req.user;
        const { content, sessionID, participantID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            content,
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
        const [session, participant] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),

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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        if (!participant) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        const newMessage = await MessageService.createMessage({
            sessionID,
            participantID,
            content,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Gửi tin nhắn"),
            result: newMessage,
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getMessageList = async (req, res, next) => {
    try {
        const user = req.user;
        const { lastMessageID, sessionID } = req.query;
        const { limit } = getPaginationInfo(req);

        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            sessionID,
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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const messageList = await MessageService.getMessageList({
            sessionID,
            lastMessageID,
            limit,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.QUERY_SUCCESS("Tin nhắn"),
            result: {
                items: messageList.map((item) => mapMessage(item)),
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

export const sendQuestion = async (req, res, next) => {
    try {
        const user = req.user;
        const { content, sessionID, participantID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            content,
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
        const [session, participant] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),

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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        if (!participant) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        const newQuestion = await QuestionService.createQuestion({
            sessionID,
            participantID,
            content: content,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Gửi câu hỏi"),
            result: newQuestion,
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getQuestionlist = async (req, res, next) => {
    try {
        const user = req.user;
        const { sessionID } = req.query;
        const { limit, offset } = getPaginationInfo(req);
        const isAnswered = queryParamToBool(req.query.isAnswered);

        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            sessionID,
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
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const questionList = await QuestionService.getQuestion({
            sessionID,
            limit,
            offset,
            isAnswered,
        });

        const total = await QuestionService.countQuestion({
            sessionID,
            isAnswered,
        });

        const promise = questionList.map((item) => QuestionService.getQuestionUpvote({ questionID: item.questionID }));

        const questionUpvote = await Promise.all(promise);
        questionUpvote.forEach((item, index) => {
            questionList[index].votes = item;
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.QUERY_SUCCESS("Câu hỏi"),
            result: {
                items: questionList,
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
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

export const upvoteQuestion = async (req, res, next) => {
    try {
        const user = req.user;
        const { questionID, sessionID, participantID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            questionID,
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
        const [session, participant, question] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),

            SessionService.findParticipant({
                participantID,
                sessionID,
            }),
            QuestionService.findQuestion({
                sessionID,
                questionID,
            }),
        ]);
        if (!session) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("phiên trình chiếu"),
            });
        }
        const isJoinable = await joinableSession(session, user);
        if (!isJoinable) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        if (!participant) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        if (!question) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        await QuestionService.createQuestionUpvote({
            questionID,
            participantID,
        });
        await QuestionService.upvoteQuestion({
            questionID,
            totalVoted: (question.totalVoted || 0) + 1,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Upvote câu hỏi"),
            result: {
                ...question,
                totalVoted: (question.totalVoted || 0) + 1,
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

export const markAnwseredQuestion = async (req, res, next) => {
    try {
        const user = req.user;
        const { questionID, sessionID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            questionID,
            sessionID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const [session, question] = await Promise.all([
            SessionService.findSession({
                sessionID,
                host: user.accountID,
            }),
            QuestionService.findQuestion({
                sessionID,
                questionID,
            }),
        ]);
        if (!session) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("phiên trình chiếu"),
            });
        }
        if (!question) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Người tham gia"),
            });
        }
        await QuestionService.markAnsweredQuestion({
            questionID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Upvote câu hỏi"),
            result: {
                ...question,
                isAnswered: true,
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

export const getSessionDetail = async (req, res, next) => {
    try {
        const user = req.user;
        const { sessionID } = req.params;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            sessionID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const [session, presentation] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),
            PresentationService.findAccessiblePresentation(
                {
                    sessionID,
                    accountID: user.accountID,
                },
                false
            ),
        ]);
        if (!session || !presentation) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Phiên trình chiếu"),
            });
        }

        const slides = await getDetailSlideOfPresentation(
            {
                presentationID: presentation.presentationID,
            },
            true
        );
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                session,
                presentation: {
                    ...presentation,
                    slides,
                },
            },
            message: MESSAGE.QUERY_SUCCESS("Thông tin phiên trình chiếu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getSessionParticipant = async (req, res, next) => {
    try {
        const user = req.user;
        const { sessionID, name } = req.query;
        const { offset, limit } = getPaginationInfo(req);
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            sessionID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const [session, presentation] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),
            PresentationService.findAccessiblePresentation(
                {
                    sessionID,
                    accountID: user.accountID,
                },
                false
            ),
        ]);
        if (!session || !presentation) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("Phiên trình chiếu"),
            });
        }

        const participants = await SessionService.getSessionParticipant({
            sessionID,
            offset,
            limit,
            name,
        });

        const total = await SessionService.countSessionParticipant({
            sessionID,
            name,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: participants,
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
            },
            message: MESSAGE.QUERY_SUCCESS("Người tham gia phiên trình chiếu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const changeSlide = async (req, res, next) => {
    try {
        const user = req.user;
        const { slideID, sessionID } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            slideID,
            sessionID,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }
        const [session, presentation] = await Promise.all([
            SessionService.findSession({
                sessionID,
            }),
            PresentationService.findPresentation(
                {
                    sessionID,
                },
                false
            ),
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
        const slide = await SlideService.findSlide({ slideID, presentationID: presentation.presentationID });
        if (!slide) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Slide"),
            });
        }
        await PresentationService.updatePresentation({
            name: presentation.name,
            updatedBy: user.accountID,
            currentSlideID: slide.slideID,
            presentationID: presentation.presentationID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: slide,
            message: MESSAGE.POST_SUCCESS("Chuyển slide"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const endSession = async (req, res, next) => {
    try {
        const user = req.user;
        const { sessionID } = req.body;
        const session = await SessionService.findSession({
            sessionID,
            host: user.accountID,
        });

        if (!session) {
            return res.status(RESPONSE_CODE.NOT_FOUND).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.QUERY_NOT_FOUND("phiên trình chiếu"),
            });
        }

        await SessionService.updateSession({
            sessionID,
            status: SESSION_STATUS.ENDED,
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            message: MESSAGE.POST_SUCCESS("Kết thúc phiên trình chiếu"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
