import SlideTable, {
    HeadingSlideTable,
    MultipleChoiceSlideOptionTable,
    MultipleChoiceSlideTable,
    ParagraphSlideTable,
    SLIDE_TYPE,
    SlideResultTable,
} from "./slide.model";

export const createSlide = async ({
    type,
    presentationID,
    slideOrder,
    horizontalAlignment,
    verticalAlignment,
    textSize,
    textColor,
    textBackground,
}) => {
    const newSlide = (
        await SlideTable.create({
            type,
            presentationID,
            slideOrder,
            horizontalAlignment,
            verticalAlignment,
            textSize,
            textColor,
            textBackground,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createMultipleChoiceSlide = async ({ slideID, question, chartType }) => {
    const newSlide = (
        await MultipleChoiceSlideTable.create({
            slideID,
            question,
            chartType: chartType || null,
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

export const createMultipleChoiceSlideOption = async ({ slideID, option, color }) => {
    const newSlide = (
        await MultipleChoiceSlideOptionTable.create({
            slideID,
            option,
            color: color || null,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createSlideResult = async ({ slideID, participantID, value }) => {
    const newSlide = (
        await SlideResultTable.create({
            slideID,
            participantID,
            value,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const findSlideResult = async (data) => {
    return SlideResultTable.findOne({
        raw: true,
        where: {
            ...(data && data),
        },
    });
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

export const deleteSlideContent = ({ slideID, type }, force = false) => {
    if (type === SLIDE_TYPE.HEADING) {
        return HeadingSlideTable.destroy({
            where: {
                slideID,
            },
            force: force,
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

export const deleteMultipleChoiceSlideOption = ({ slideID, optionID }) => {
    return MultipleChoiceSlideOptionTable.destroy({
        where: {
            slideID,
            ...(optionID && { optionID }),
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
            },
        ],
    });
};

export const getMultipleChoiceSlideOption = ({ slideID }) => {
    return MultipleChoiceSlideOptionTable.findAll({
        raw: true,
        where: {
            slideID,
        },
    });
};

export const findMultipleChoiceSlideOption = (data) => {
    return MultipleChoiceSlideOptionTable.findOne({
        raw: true,
        where: {
            ...(data && data),
        },
    });
};

export const getSlideResult = ({ slideID }) => {
    return SlideResultTable.findAll({
        raw: true,
        where: {
            slideID,
        },
    });
};

export const updateHeadingSlide = async ({ slideID, heading, subHeading }) => {
    const result = await HeadingSlideTable.update(
        {
            ...(heading && { heading }),
            ...(subHeading && { subHeading }),
        },
        {
            where: {
                slideID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const updateParagraphSlide = async ({ slideID, heading, paragraph }) => {
    const result = await ParagraphSlideTable.update(
        {
            ...(heading && { heading }),
            ...(paragraph && { paragraph }),
        },
        {
            where: {
                slideID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const updateMultipleChoiceSlide = async ({ slideID, question, chartType }) => {
    const result = await MultipleChoiceSlideTable.update(
        {
            ...(question && { question }),
            ...(chartType !== undefined && { chartType }),
        },
        {
            where: {
                slideID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const findSlide = async (data) => {
    return SlideTable.findOne({
        raw: true,
        where: {
            ...data,
        },
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
            },
        ],
    });
};

export const updateMultipleChoiceSlideOption = async ({ slideID, optionID, option, color }) => {
    const result = await MultipleChoiceSlideOptionTable.update(
        {
            ...(option && { option }),
            ...(color !== undefined && { color }),
        },
        {
            where: {
                slideID,
                optionID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};

export const updateSlide = async ({
    slideID,
    presentationID,
    slideOrder,
    type,
    horizontalAlignment,
    verticalAlignment,
    textSize,
    textColor,
    textBackground,
}) => {
    const result = await SlideTable.update(
        {
            slideOrder,
            ...(type && { type }),
            ...(horizontalAlignment !== undefined && { horizontalAlignment }),
            ...(verticalAlignment !== undefined && { verticalAlignment }),
            ...(textSize !== undefined && { textSize }),
            ...(textColor !== undefined && { textColor }),
            ...(textBackground !== undefined && { textBackground }),
        },
        {
            where: {
                slideID,
                presentationID,
            },
            raw: true,
            returning: true,
        }
    );
    return result && result.length ? result[1] : null;
};
