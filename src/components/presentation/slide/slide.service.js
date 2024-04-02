import SlideTable, {
    BulletListSlideItemTable,
    BulletListSlideTable,
    HeadingSlideTable,
    MultipleChoiceSlideOptionTable,
    MultipleChoiceSlideTable,
    ParagraphSlideTable,
    QuoteSlideTable,
    SLIDE_TYPE,
    SlideResultTable,
    WordCloudSlideOptionTable,
    WordCloudSlideTable,
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
    layout,
    mediaID,
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
            layout,
            mediaID,
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

export const createMultipleChoiceSlideOptionArray = async (array) => {
    const newItems = await MultipleChoiceSlideOptionTable.bulkCreate(array);
    return newItems;
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

export const createQuoteSlide = async ({ slideID, quote, author }) => {
    const newSlide = (
        await QuoteSlideTable.create({
            slideID,
            quote,
            author,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createBulletListSlide = async ({ slideID, heading }) => {
    const newSlide = (
        await BulletListSlideTable.create({
            slideID,
            heading,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createBulletListSlideItemArray = async (array) => {
    const newItems = await BulletListSlideItemTable.bulkCreate(array);
    return newItems;
};

export const createBulletListSlideItem = async ({ slideID, value }) => {
    const newSlide = (
        await BulletListSlideItemTable.create({
            slideID,
            value,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createWordCloudSlide = async ({ slideID, question }) => {
    const newSlide = (
        await WordCloudSlideTable.create({
            slideID,
            question,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createWordCloudSlideOption = async ({ slideID, participantID, option }) => {
    const newSlide = (
        await WordCloudSlideOptionTable.create({
            slideID,
            option,
            participantID,
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

export const findWordCloundSlideOption = async (data) => {
    return WordCloudSlideOptionTable.findOne({
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
            force: force,
        });
    }
    if (type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        return MultipleChoiceSlideTable.destroy({
            where: {
                slideID,
            },
            force: force,
        });
    }
    if (type === SLIDE_TYPE.BULLET_LIST) {
        return BulletListSlideTable.destroy({
            where: {
                slideID,
            },
            force: force,
        });
    }
    if (type === SLIDE_TYPE.QUOTE) {
        return QuoteSlideTable.destroy({
            where: {
                slideID,
            },
            force: force,
        });
    }
    if (type === SLIDE_TYPE.WORD_CLOUD) {
        return WordCloudSlideTable.destroy({
            where: {
                slideID,
            },
            force: force,
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

export const deleteBulletListSlideItem = ({ slideID, bulletListSlideItemID }) => {
    return BulletListSlideItemTable.destroy({
        where: {
            slideID,
            ...(bulletListSlideItemID && { bulletListSlideItemID }),
        },
    });
};

export const deleteWordCloudSlideOption = ({ slideID, wordCloudSlideOptionID }) => {
    return WordCloudSlideOptionTable.destroy({
        where: {
            slideID,
            ...(wordCloudSlideOptionID && { wordCloudSlideOptionID }),
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

export const getSlideOfPresentation = ({ presentationID, offset, limit }) => {
    return SlideTable.findAll({
        raw: true,
        where: {
            presentationID,
        },
        order: [["slideOrder", "ASC"]],
        offset: offset || 0,
        limit: limit || 1000,
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
            {
                model: QuoteSlideTable,
                duplicating: false,
            },
            {
                model: BulletListSlideTable,
                duplicating: false,
            },
            {
                model: WordCloudSlideTable,
                duplicating: false,
            },
        ],
    });
};

export const findMaxSlideOrder = ({ presentationID }) => {
    return SlideTable.max("slideOrder", {
        where: {
            presentationID,
        },
    });
};

export const getMultipleChoiceSlideOption = ({ slideID }) => {
    return MultipleChoiceSlideOptionTable.findAll({
        raw: true,
        order: [["createdAt", "ASC"]],
        where: {
            slideID,
        },
    });
};

export const getBulletListSlideItem = ({ slideID }) => {
    return BulletListSlideItemTable.findAll({
        raw: true,
        where: {
            slideID,
        },
        order: [["createdAt", "ASC"]],
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
        order: [["createdAt", "ASC"]],
    });
};

export const getWordCloudSlideOption = ({ slideID }) => {
    return WordCloudSlideOptionTable.findAll({
        raw: true,
        where: {
            slideID,
        },
        order: [["createdAt", "ASC"]],
    });
};

export const updateHeadingSlide = async ({ slideID, heading, subHeading }) => {
    const result = await HeadingSlideTable.update(
        {
            ...(heading !== undefined && { heading }),
            ...(subHeading !== undefined && { subHeading }),
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
            ...(heading !== undefined && { heading }),
            ...(paragraph !== undefined && { paragraph }),
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
            ...(question !== undefined && { question }),
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

export const updateQuoteSlide = async ({ slideID, quote, author }) => {
    const result = await QuoteSlideTable.update(
        {
            ...(quote !== undefined && { quote }),
            ...(author !== undefined && { author }),
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

export const updateBulletListSlide = async ({ slideID, heading }) => {
    const result = await BulletListSlideTable.update(
        {
            ...(heading !== undefined && { heading }),
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

export const updateWordCloudSlide = async ({ slideID, question }) => {
    const result = await WordCloudSlideTable.update(
        {
            ...(question !== undefined && { question }),
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

export const updateBulletListSlideItem = async ({ slideID, bulletListSlideItemID, value }) => {
    const result = await BulletListSlideItemTable.update(
        {
            ...(value !== undefined && { value }),
        },
        {
            where: {
                slideID,
                bulletListSlideItemID,
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
            {
                model: QuoteSlideTable,
                duplicating: false,
            },
            {
                model: BulletListSlideTable,
                duplicating: false,
            },
            {
                model: WordCloudSlideTable,
                duplicating: false,
            },
        ],
    });
};

export const updateMultipleChoiceSlideOption = async ({ slideID, optionID, option, color }) => {
    const result = await MultipleChoiceSlideOptionTable.update(
        {
            ...(option !== undefined && { option }),
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
    layout,
    mediaID,
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
            ...(layout !== undefined && { layout }),
            ...(mediaID !== undefined && { mediaID }),
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
