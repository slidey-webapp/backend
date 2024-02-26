import { models } from "../../../database";
const SlideTable = models.Slide;
export default SlideTable;

export const MultipleChoiceSlideTable = models.MultipleChoiceSlide;
export const HeadingSlideTable = models.HeadingSlide;
export const ParagraphSlideTable = models.ParagraphSlide;
export const SlideResultTable = models.SlideResult;
export const MultipleChoiceSlideOptionTable = models.MultipleChoiceSlideOption;
export const QuoteSlideTable = models.QuoteSlide;
export const WordCloudSlideTable = models.WordCloudSlide;
export const WordCloudSlideOptionTable = models.WordCloudSlideOption;
export const BulletListSlideTable = models.BulletListSlide;
export const BulletListSlideItemTable = models.BulletListSlideItem;

export const SLIDE_TYPE = {
    HEADING: "HEADING",
    PARAGRAPH: "PARAGRAPH",
    MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
    QUOTE: "QUOTE",
    BULLET_LIST: "BULLET_LIST",
    WORD_CLOUD: "WORD_CLOUD",
};
