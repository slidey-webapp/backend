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
