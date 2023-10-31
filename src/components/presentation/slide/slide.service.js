import SlideTable, {
    HeadingSlideTable,
    MultipleChoiceSlideOptionTable,
    MultipleChoiceSlideTable,
    ParagraphSlideTable,
    SLIDE_TYPE,
    SlideResultTable,
} from "./slide.model";

export const createSlide = async ({ type, presentationID, slideOrder }) => {
    const newSlide = (
        await SlideTable.create({
            type,
            presentationID,
            slideOrder,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createMultipleChoiceSlide = async ({ slideID, question }) => {
    const newSlide = (
        await MultipleChoiceSlideTable.create({
            slideID,
            question,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createHeadingSlide = async ({ slideID, heading, subHeading }) => {
    const newSlide = (
        await HeadingSlideTable.create({
            slideID,
            heading,
            subHeading,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createParagraphSlide = async ({ slideID, heading, paragraph }) => {
    const newSlide = (
        await ParagraphSlideTable.create({
            slideID,
            heading,
            paragraph,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createMultipleChoiceSlideOption = async ({ slideID, option }) => {
    const newSlide = (
        await MultipleChoiceSlideOptionTable.create({
            slideID,
            option,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createSlideResult = async ({ slideID, accountID, value }) => {
    const newSlide = (
        await SlideResultTable.create({
            slideID,
            accountID,
            value,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const deleteSlide = ({ slideID }) => {
    return SlideTable.destroy({
        where: {
            slideID,
        },
    });
};

export const deleteSlideOfPresentation = ({ presentationID }) => {
    return SlideTable.destroy({
        where: {
            presentationID,
        },
    });
};

export const deleteSlideContent = ({ slideID, type }) => {
    if (type === SLIDE_TYPE.HEADING) {
        return HeadingSlideTable.destroy({
            where: {
                slideID,
            },
        });
    }
    if (type === SLIDE_TYPE.PARAGRAPH) {
        return ParagraphSlideTable.destroy({
            where: {
                slideID,
            },
        });
    }
    if (type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        return MultipleChoiceSlideTable.destroy({
            where: {
                slideID,
            },
        });
    }
};

export const deleteMultipleChoiceSlideOption = ({ slideID }) => {
    return MultipleChoiceSlideOptionTable.destroy({
        where: {
            slideID,
        },
    });
};

export const deleteSlideResult = ({ slideID }) => {
    return SlideResultTable.destroy({
        where: {
            slideID,
        },
    });
};

export const getSlideOfPresentation = ({ presentationID }) => {
    return SlideTable.findAll({
        raw: true,
        where: {
            presentationID,
        },
        order: [["slideOrder", "ASC"]],
        include: [
            {
                model: HeadingSlideTable,
                duplicating: false,
            },
            {
                model: ParagraphSlideTable,
                duplicating: false,
            },
            {
                model: MultipleChoiceSlideTable,
                duplicating: false,
                include: [
                    {
                        model: MultipleChoiceSlideOptionTable,
                        duplicating: false,
                    },
                ],
            },
        ],
    });
};
