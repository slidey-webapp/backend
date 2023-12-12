import { SLIDE_TYPE } from "./slide.model";
import * as SlideService from "./slide.service";
export const deleteSlideReference = ({ slideID, type }) => {
    const promises = [
        SlideService.deleteSlideContent({ slideID, type }),
        SlideService.deleteSlideResult({ slideID }),
        SlideService.deleteMultipleChoiceSlideOption({ slideID }),
    ];
    return Promise.all(promises);
};

export const mapSlide = (slide) => {
    const result = {};
    Object.keys(slide).forEach((key) => {
        if (key.includes(".")) {
            switch (slide.type) {
                case SLIDE_TYPE.HEADING:
                    result.heading = slide["HeadingSlide.heading"];
                    result.subHeading = slide["HeadingSlide.subHeading"];
                    break;
                case SLIDE_TYPE.PARAGRAPH:
                    result.heading = slide["ParagraphSlide.heading"];
                    result.paragraph = slide["ParagraphSlide.paragraph"];
                    break;
                case SLIDE_TYPE.MULTIPLE_CHOICE:
                    result.question = slide["MultipleChoiceSlide.question"];
                    break;
                default:
                    break;
            }
        } else {
            result[key] = slide[key];
        }
    });
    return result;
};

export const slideGenerator = async ({
    presentationID,
    type,
    slideOrder,
    heading,
    subHeading,
    question,
    paragraph,
}) => {
    const slide = await SlideService.createSlide({
        type,
        presentationID,
        slideOrder,
    });
    const slideID = slide.slideID;
    if (type === SLIDE_TYPE.HEADING) {
        await SlideService.createHeadingSlide({
            slideID,
            heading: heading || "",
            subHeading: subHeading || "",
        });
        slide.subHeading = subHeading || "";
        slide.heading = heading || "";
    } else if (type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        await SlideService.createMultipleChoiceSlide({
            slideID,
            question: question || "",
        });
        slide.question = question || "";
    } else if (type === SLIDE_TYPE.PARAGRAPH) {
        await SlideService.createParagraphSlide({
            slideID,
            paragraph: paragraph || "",
            heading: heading || "",
        });
        slide.paragraph = paragraph || "";
        slide.heading = heading || "";
    }
    return slide;
};

export const cloneSlides = async (slides, presentationID) => {
    const createSlidePromises = slides.map((slide) => {
        return slideGenerator({
            ...slide,
            presentationID,
        });
    });
    const createOptionsPromises = [];
    const newSlides = await Promise.all(createSlidePromises);
    newSlides.forEach((newSlide) => {
        if (newSlide.type === SLIDE_TYPE.MULTIPLE_CHOICE) {
            const oldSlide = slides.find((item) => item.slideOrder === newSlide.slideOrder);
            oldSlide.options.forEach((item) => {
                createOptionsPromises.push(
                    SlideService.createMultipleChoiceSlideOption({
                        slideID: newSlide.slideID,
                        option: item.option,
                    })
                );
            });
        }
    });
    await Promise.all(createOptionsPromises);
    return newSlides;
};

const getSlideDetail = async (slide, getSlideResult = false) => {
    const result = { ...slide };
    const [option] = await Promise.all([
        SlideService.getMultipleChoiceSlideOption({
            slideID: slide.slideID,
        }),
    ]);
    if (slide.type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        if (getSlideResult) {
            const resultPromise = option.map((item) => {
                return SlideService.findSlideResult({
                    value: item.option,
                    slideID: slide.slideID,
                });
            });
            const slideResult = await Promise.all(resultPromise);
            option.forEach((item) => {
                const results = slideResult.filter(
                    (item1) => item1 && item1.value === item.option && item1.slideID === item.slideID
                );
                item.result = results.map((item1) => ({
                    participantID: item1.participantID,
                    createdAt: item1.createdAt,
                    slideResultID: item1.slideResultID,
                }));
            });
        }

        result.options = option;
    }
    return result;
};

export const getDetailSlideOfPresentation = async ({ presentationID }, getSlideResult = false) => {
    let slides = await SlideService.getSlideOfPresentation({
        presentationID,
    });
    slides = slides.map((item) => mapSlide(item));
    slides = await Promise.all(slides.map((item) => getSlideDetail(item, getSlideResult)));
    return slides;
};
