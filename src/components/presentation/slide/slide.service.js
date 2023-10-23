import SlideTable, {
    HeadingSlideTable,
    MultipleChoiceSlideOptionTable,
    ParagraphSlideTable,
    SlideResultTable,
} from "./slide.model";

export const createSlide = async ({ type, presenetationID, slideOrder }) => {
    const newSlide = (
        await SlideTable.create({
            type,
            presenetationID,
            slideOrder,
        })
    ).get({
        plain: true,
    });
    return newSlide;
};

export const createMultipleChoiceSlide = async ({ slideID, question }) => {
    const newSlide = (
        await MultipleChoiceSlideOptionTable.create({
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
