import { models } from "../../database";
const SlideTable = models.Slide;
export default SlideTable;

export const MultipleChoiceSlideTable = models.MultipleChoiceSlide;
export const HeadingSlideTable = models.HeadingSlide;
export const ParagraphSlideTable = models.ParagraphSlide;
export const SlideResultTable = models.SlideResult;
export const MultipleChoiceSlideOptionTable = models.MultipleChoiceSlideOption;

export const SLIDE_TYPE = {
    HEADING: "HEADING",
    PARAGRAPH: "PARAGRAPH",
    MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
};
