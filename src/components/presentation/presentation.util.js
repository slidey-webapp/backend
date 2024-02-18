import { getCode } from "../../utilities/string";
import * as PresentationService from "./presentation.service";

export const isExistedCode = (code) => {
    return PresentationService.findPresentation({
        code,
    });
};

export const getPresentationCode = async () => {
    return getCode(isExistedCode, 8);
};
