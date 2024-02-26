import * as PresentationService from "./presentation.service";
import * as SlideService from "./slide/slide.service";
import * as CollabService from "./collaboration/collaboration.service";
import * as MESSAGE from "../../resource/message";
import { API_STATUS, INPUT_ERROR, RESPONSE_CODE } from "../../config/contants";
import { handleEmptyInput } from "../../utilities/api";
import { SLIDE_TYPE } from "./slide/slide.model";
import { getPaginationInfo } from "../../utilities/pagination";
import { deleteSlideReference, getDetailSlideOfPresentation, mapSlide, slideGenerator } from "./slide/slide.util";
import { getPresentationCode } from "./presentation.util";
import { mapCollaborator } from "../../utilities/mapUser";
import { getFullAccountInfo } from "../account/account.util";
import { emitUpdatePresentation } from "../socket/socket.eventEmitter";

export const createPresentation = async (req, res, next) => {
    try {
        const { name } = req.body;
        const user = req.user;
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
        const code = await getPresentationCode();
        const newPresentation = await PresentationService.createPresentation({
            name,
            accountID: user.accountID,
            code,
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
        await PresentationService.updatePresentation({
            presentationID: newPresentation.presentationID,
            currentSlideID: firstSlide.slideID,
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
        const { offset, limit } = getPaginationInfo(req);
        const name = req.query.name;
        const presentations = await PresentationService.getUserPresentation({
            accountID: user.accountID,
            offset,
            limit,
            name,
        });
        const total = await PresentationService.countPresentation({
            accountID: user.accountID,
            name,
        });
        const [presentCollabs, presentCreators] = await Promise.all([
            Promise.all(
                presentations.map((item) =>
                    CollabService.getCollaborator({
                        presentationID: item.presentationID,
                        offset: 0,
                        limit: 1000,
                    })
                )
            ),
            Promise.all(presentations.map((item) => getFullAccountInfo({ accountID: item.createdBy }, user))),
        ]);
        presentations.forEach((item, index) => {
            item.collaborators = (presentCollabs[index] || []).map((item) => mapCollaborator(item));
            item.creator = presentCreators[index] || null;
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: presentations,
                totalCount: total,
                totalPages: total ? Math.floor(total / limit) + 1 : 0,
                limit,
                offset,
                currentPage: Math.floor(offset / limit),
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
        const slides = await SlideService.getSlideOfPresentation({
            presentationID,
        });
        const promises = slides.map((slide) => deleteSlideReference({ slideID: slide.slideID, type: slide.type }));
        await Promise.all(promises);
        await SlideService.deleteSlideOfPresentation({
            presentationID,
        });
        await PresentationService.deletePresentation({
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

export const getPresentationSlides = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID } = req.query;
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
            presentationID,
            accountID: user.accountID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const slides = await getDetailSlideOfPresentation({
            presentationID,
        });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                items: slides.map((slide) => mapSlide(slide)),
                totalCount: slides.length,
            },
            message: MESSAGE.QUERY_SUCCESS("Slide"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const addSlide = async (req, res, next) => {
    try {
        const user = req.user;
        const {
            presentationID,
            horizontalAlignment,
            verticalAlignment,
            textSize,
            textColor,
            textBackground,
            chartType,
        } = req.body;
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
        const type = req.body.type || SLIDE_TYPE.MULTIPLE_CHOICE;
        if (!SLIDE_TYPE[type]) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: MESSAGE.INVALID_INPUT("Loại slide"),
                errors: {
                    type: INPUT_ERROR.INVALID,
                },
            });
        }
        const presentation = await PresentationService.findAccessiblePresentation({
            presentationID,
            accountID: user.accountID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const slides = await SlideService.getSlideOfPresentation({
            presentationID,
        });
        const slide = await slideGenerator({
            presentationID,
            type,
            slideOrder: slides.length + 1,
            horizontalAlignment,
            verticalAlignment,
            textSize,
            textColor,
            textBackground,
            chartType,
        });
        getDetailSlideOfPresentation({
            presentationID,
        }).then((newSlides) => {
            emitUpdatePresentation({
                presentation: { ...presentation, slides: newSlides.map((item) => mapSlide(item)) },
                user,
            });
        });

        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: slide,
            message: MESSAGE.POST_SUCCESS("Tạo slide"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};

export const getPresentationDetail = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID } = req.params;
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

        const presentation = await PresentationService.findAccessiblePresentation(
            {
                presentationID,
                accountID: user.accountID,
            },
            false
        );
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const [slides, creator] = await Promise.all([
            getDetailSlideOfPresentation({
                presentationID,
            }),
            getFullAccountInfo(
                {
                    accountID: presentation.createdBy,
                },
                user
            ),
        ]);
        presentation.creator = creator;
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: {
                ...presentation,
                slides, // slides.map((item) => mapSlide(item)),
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

export const updatePresentation = async (req, res, next) => {
    try {
        const user = req.user;
        const { presentationID, name, slides } = req.body;
        const { message: emptyMessage, inputError: emptyInputError } = handleEmptyInput({
            presentationID,
            name,
            slides,
        });
        if (emptyMessage) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.INVALID_INPUT,
                message: emptyMessage,
                errors: emptyInputError,
            });
        }

        const presentation = await PresentationService.findAccessiblePresentation({
            presentationID,
            accountID: user.accountID,
        });
        if (!presentation) {
            return res.status(RESPONSE_CODE.FORBIDDEN).json({
                status: API_STATUS.PERMISSION_DENIED,
                message: MESSAGE.PERMISSION_NOT_FOUND,
            });
        }
        const newSlides = [...slides];
        const oldSlides = (
            await getDetailSlideOfPresentation({
                presentationID,
            })
        ).map((item) => mapSlide(item));

        const nOldSlides = oldSlides.length;
        const nNewSlides = newSlides.length;
        const validateSlidesPromises = [];
        for (let i = 0; i < nNewSlides; i++) {
            validateSlidesPromises.push(
                SlideService.findSlide({
                    slideID: newSlides[i].slideID,
                    presentationID: presentationID,
                })
            );
        }
        if ((await Promise.all(validateSlidesPromises)).some((item) => !item)) {
            return res.status(RESPONSE_CODE.BAD_REQUEST).json({
                status: API_STATUS.NOT_FOUND,
                message: MESSAGE.INVALID_INPUT("danh sách slides"),
            });
        }
        const promises = [];
        // Compare the old slides with the new slides
        for (let i = 0; i < nOldSlides; i++) {
            let isDeleted = true;
            for (let j = 0; j < nNewSlides; j++) {
                if (newSlides[j].slideID === oldSlides[i].slideID) {
                    isDeleted = false;
                    //update the slide content
                    if (newSlides[j].type === oldSlides[i].type) {
                        switch (newSlides[j].type) {
                            case SLIDE_TYPE.HEADING:
                                promises.push(
                                    SlideService.updateHeadingSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                        subHeading: newSlides[j].subHeading,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.MULTIPLE_CHOICE:
                                promises.push(
                                    SlideService.updateMultipleChoiceSlide({
                                        slideID: newSlides[j].slideID,
                                        question: newSlides[j].question,
                                        chartType: newSlides[j].chartType,
                                    })
                                );
                                if (!newSlides[j].options) {
                                    newSlides[j].options = [];
                                }
                                if (!oldSlides[i].options) {
                                    oldSlides[i].options = [];
                                }
                                for (let k = 0; k < newSlides[j].options.length; k++) {
                                    if (!newSlides[j].options[k].optionID) {
                                        promises.push(
                                            SlideService.createMultipleChoiceSlideOption({
                                                slideID: newSlides[j].slideID,
                                                option: newSlides[j].options[k].option,
                                                color: newSlides[j].options[k].color,
                                            })
                                        );
                                    }
                                }
                                for (let k = 0; k < oldSlides[i].options.length; k++) {
                                    let isDeletedOption = true;
                                    for (let l = 0; l < newSlides[j].options.length; l++) {
                                        if (newSlides[j].options[l].optionID === oldSlides[i].options[k].optionID) {
                                            promises.push(
                                                SlideService.updateMultipleChoiceSlideOption({
                                                    slideID: newSlides[j].slideID,
                                                    option: newSlides[j].options[l].option,
                                                    optionID: newSlides[j].options[l].optionID,
                                                    color: newSlides[j].options[l].color,
                                                })
                                            );
                                            isDeletedOption = false;
                                        }
                                    }
                                    if (isDeletedOption) {
                                        promises.push(
                                            SlideService.deleteMultipleChoiceSlideOption({
                                                slideID: oldSlides[i].slideID,
                                                optionID: oldSlides[i].options[k].optionID,
                                            })
                                        );
                                    }
                                }
                                break;
                            case SLIDE_TYPE.PARAGRAPH:
                                promises.push(
                                    SlideService.updateParagraphSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                        paragraph: newSlides[j].paragraph,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.QUOTE: {
                                promises.push(
                                    SlideService.updateQuoteSlide({
                                        slideID: newSlides[j].slideID,
                                        author: newSlides[j].author,
                                        quote: newSlides[j].quote,
                                    })
                                );
                                break;
                            }
                            case SLIDE_TYPE.WORD_CLOUD: {
                                promises.push(
                                    SlideService.updateWordCloudSlide({
                                        slideID: newSlides[j].slideID,
                                        question: newSlides[j].question,
                                    })
                                );
                                break;
                            }
                            case SLIDE_TYPE.BULLET_LIST: {
                                promises.push(
                                    SlideService.updateBulletListSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                    })
                                );
                                if (!newSlides[j].items) {
                                    newSlides[j].items = [];
                                }
                                if (!oldSlides[i].items) {
                                    oldSlides[i].items = [];
                                }
                                for (let k = 0; k < newSlides[j].items.length; k++) {
                                    if (!newSlides[j].items[k].bulletListSlideItemID) {
                                        promises.push(
                                            SlideService.createBulletListSlideItem({
                                                slideID: newSlides[j].slideID,
                                                value: newSlides[j].items[k].value,
                                            })
                                        );
                                    }
                                }
                                for (let k = 0; k < oldSlides[i].items.length; k++) {
                                    let isDeletedItem = true;
                                    for (let l = 0; l < newSlides[j].items.length; l++) {
                                        if (
                                            newSlides[j].items[l].bulletListSlideItemID ===
                                            oldSlides[i].items[k].bulletListSlideItemID
                                        ) {
                                            promises.push(
                                                SlideService.updateBulletListSlideItem({
                                                    slideID: newSlides[j].slideID,
                                                    value: newSlides[j].items[l].value,
                                                    bulletListSlideItemID: newSlides[j].items[l].bulletListSlideItemID,
                                                })
                                            );
                                            isDeletedItem = false;
                                        }
                                    }
                                    if (isDeletedItem) {
                                        promises.push(
                                            SlideService.deleteBulletListSlideItem({
                                                slideID: oldSlides[i].slideID,
                                                bulletListSlideItemID: oldSlides[i].items[k].bulletListSlideItemID,
                                            })
                                        );
                                    }
                                }
                                break;
                            }
                            default:
                                break;
                        }
                    } else {
                        promises.push(
                            SlideService.deleteSlideContent(
                                {
                                    slideID: oldSlides[i].slideID,
                                    type: oldSlides[i].type,
                                },
                                true
                            )
                        );
                        switch (newSlides[j].type) {
                            case SLIDE_TYPE.HEADING:
                                promises.push(
                                    SlideService.createHeadingSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                        subHeading: newSlides[j].subHeading,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.PARAGRAPH:
                                promises.push(
                                    SlideService.createParagraphSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                        paragraph: newSlides[j].paragraph,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.MULTIPLE_CHOICE:
                                promises.push(
                                    SlideService.createMultipleChoiceSlide({
                                        slideID: newSlides[j].slideID,
                                        question: newSlides[j].question,
                                        chartType: newSlides[j].chartType,
                                    })
                                );
                                (newSlides[j].options || []).forEach((item) => {
                                    promises.push(
                                        SlideService.createMultipleChoiceSlideOption({
                                            slideID: newSlides[j].slideID,
                                            option: item.option,
                                            color: item.color,
                                        })
                                    );
                                });
                                break;
                            case SLIDE_TYPE.QUOTE:
                                promises.push(
                                    SlideService.createQuoteSlide({
                                        slideID: newSlides[j].slideID,
                                        quote: newSlides[j].quote,
                                        author: newSlides[j].author,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.WORD_CLOUD:
                                promises.push(
                                    SlideService.createWordCloudSlide({
                                        slideID: newSlides[j].slideID,
                                        question: newSlides[j].question,
                                    })
                                );
                                break;
                            case SLIDE_TYPE.BULLET_LIST:
                                promises.push(
                                    SlideService.createBulletListSlide({
                                        slideID: newSlides[j].slideID,
                                        heading: newSlides[j].heading,
                                    })
                                );
                                (newSlides[j].items || []).forEach((item) => {
                                    promises.push(
                                        SlideService.createBulletListSlideItem({
                                            slideID: newSlides[j].slideID,
                                            value: item.value,
                                        })
                                    );
                                });
                                break;
                            default:
                                break;
                        }
                    }

                    //update the slide infomation
                    promises.push(
                        SlideService.updateSlide({
                            slideID: newSlides[j].slideID,
                            presentationID,
                            slideOrder: newSlides[j].slideOrder,
                            type: newSlides[j].type,
                            horizontalAlignment: newSlides[j].horizontalAlignment,
                            verticalAlignment: newSlides[j].verticalAlignment,
                            textSize: newSlides[j].textSize,
                            textColor: newSlides[j].textColor,
                            textBackground: newSlides[j].textBackground,
                        })
                    );
                    break;
                }
            }
            if (isDeleted) {
                await Promise.all([
                    SlideService.deleteSlideContent({
                        slideID: oldSlides[i].slideID,
                        type: oldSlides[i].type,
                    }),
                    SlideService.deleteSlideResult({
                        slideID: oldSlides[i].slideID,
                    }),
                ]);
                await SlideService.deleteSlide({
                    slideID: oldSlides[i].slideID,
                });
            }
        }
        promises.push(
            PresentationService.updatePresentation({
                name,
                presentationID,
                updatedBy: user.accountID,
            })
        );
        await Promise.all(promises);
        const resultSlides = await getDetailSlideOfPresentation({
            presentationID,
        });
        const result = { ...presentation, name, slides: resultSlides.map((item) => mapSlide(item)) };
        emitUpdatePresentation({ presentation: result, user });
        return res.status(RESPONSE_CODE.SUCCESS).json({
            status: API_STATUS.OK,
            result: result,
            message: MESSAGE.POST_SUCCESS("Cập nhật bản trình bày"),
        });
    } catch (error) {
        console.log(error);
        return res.status(RESPONSE_CODE.INTERNAL_SERVER).json({
            status: API_STATUS.INTERNAL_ERROR,
            error,
        });
    }
};
