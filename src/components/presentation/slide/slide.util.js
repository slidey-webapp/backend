import { SLIDE_TYPE } from "./slide.model";
import * as SlideService from "./slide.service";
import * as MediaAssetService from "../../common/mediaAsset/mediaAsset.service";
export const deleteSlideReference = async ({ slideID, type }) => {
    const promises = [
        SlideService.deleteSlideResult({ slideID }),
        SlideService.deleteMultipleChoiceSlideOption({ slideID }),
        SlideService.deleteBulletListSlideItem({ slideID }),
        SlideService.deleteWordCloudSlideOption({ slideID }),
    ];
    await Promise.all(promises);
    return SlideService.deleteSlideContent({ slideID, type }, true);
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
                    result.chartType = slide["MultipleChoiceSlide.chartType"];
                    break;
                case SLIDE_TYPE.BULLET_LIST:
                    result.heading = slide["BulletListSlide.heading"];
                    break;
                case SLIDE_TYPE.WORD_CLOUD:
                    result.question = slide["WordCloudSlide.question"];
                    break;
                case SLIDE_TYPE.QUOTE:
                    result.quote = slide["QuoteSlide.quote"];
                    result.author = slide["QuoteSlide.author"];
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
    horizontalAlignment,
    verticalAlignment,
    textSize,
    textColor,
    textBackground,
    chartType,
    quote,
    author,
    options,
    items,
    layout,
    mediaID,
}) => {
    const slide = await SlideService.createSlide({
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
            chartType,
        });
        await SlideService.createMultipleChoiceSlideOptionArray(
            (options || []).map((option) => {
                return {
                    slideID: slideID,
                    option: option.option,
                    color: option.color,
                };
            })
        );
        slide.question = question || "";
        slide.options = [];
    } else if (type === SLIDE_TYPE.PARAGRAPH) {
        await SlideService.createParagraphSlide({
            slideID,
            paragraph: paragraph || "",
            heading: heading || "",
        });
        slide.paragraph = paragraph || "";
        slide.heading = heading || "";
    } else if (type === SLIDE_TYPE.QUOTE) {
        await SlideService.createQuoteSlide({
            slideID,
            quote: quote || "",
            author: author || "",
        });
        slide.quote = quote || "";
        slide.author = author || "";
    } else if (type === SLIDE_TYPE.WORD_CLOUD) {
        await SlideService.createWordCloudSlide({
            slideID,
            question: question || "",
        });
        slide.question = question || "";
    } else if (type === SLIDE_TYPE.BULLET_LIST) {
        await SlideService.createBulletListSlide({
            heading: heading || "",
            slideID,
        });
        await SlideService.createBulletListSlideItemArray(
            (items || []).map((item) => {
                return {
                    slideID: slideID,
                    value: item.value,
                };
            })
        );
        slide.heading = heading || "";
        slide.items = [];
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
    const newSlides = await Promise.all(createSlidePromises);
    return newSlides;
};

export const getSlideDetail = async (slide, getSlideResult = false) => {
    const result = { ...slide };
    const [option, bulletListItem, media] = await Promise.all([
        SlideService.getMultipleChoiceSlideOption({
            slideID: slide.slideID,
        }),
        SlideService.getBulletListSlideItem({
            slideID: slide.slideID,
        }),
        MediaAssetService.findMediaAsset({
            mediaID: slide.mediaID,
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

        result.options = option || [];
    } else if (slide.type === SLIDE_TYPE.BULLET_LIST) {
        result.items = bulletListItem || [];
    } else if (slide.type === SLIDE_TYPE.WORD_CLOUD) {
        if (getSlideResult) {
            const slideResult = await SlideService.getWordCloudSlideOption({
                slideID: slide.slideID,
            });
            result.options = slideResult || [];
        }
    }
    if (media && slide.mediaID) {
        result.mediaURL = media.mediaURL;
    }
    return result;
};

export const getDetailSlideOfPresentation = async ({ presentationID, offset, limit }, getSlideResult = false) => {
    let slides = await SlideService.getSlideOfPresentation({
        presentationID,
        offset,
        limit,
    });
    slides = slides.map((item) => mapSlide(item));
    slides = await Promise.all(slides.map((item) => getSlideDetail(item, getSlideResult)));
    return slides;
};
