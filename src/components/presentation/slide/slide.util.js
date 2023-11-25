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

export const slideGenerator = async ({ presentationID, type, slideOrder }) => {
    const slide = await SlideService.createSlide({
        type,
        presentationID,
        slideOrder,
    });
    const slideID = slide.slideID;
    if (type === SLIDE_TYPE.HEADING) {
        await SlideService.createHeadingSlide({
            slideID,
            heading: "",
            subHeading: "",
        });
        slide.subHeading = "";
        slide.heading = "";
    } else if (type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        await SlideService.createMultipleChoiceSlide({
            slideID,
            question: "",
        });
        slide.question = "";
    } else if (type === SLIDE_TYPE.PARAGRAPH) {
        await SlideService.createParagraphSlide({
            slideID,
            paragraph: "",
            heading: "",
        });
        slide.paragraph = "";
        slide.heading = "";
    }
    return slide;
};

const getSlideDetail = async (slide) => {
    const result = { ...slide };
    const [option] = await Promise.all([
        SlideService.getMultipleChoiceSlideOption({
            slideID: slide.slideID,
        }),
    ]);
    if (slide.type === SLIDE_TYPE.MULTIPLE_CHOICE) {
        result.options = option;
    }
    return result;
};

export const getDetailSlideOfPresentation = async ({ presentationID }) => {
    let slides = await SlideService.getSlideOfPresentation({
        presentationID,
    });
    slides = slides.map((item) => mapSlide(item));
    slides = await Promise.all(slides.map((item) => getSlideDetail(item)));
    return slides;
};
