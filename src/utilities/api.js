import { INPUT_ERROR } from "../config/contants";
import * as MESSAGE from "../resource/message";

export const handleEmptyInput = (data) => {
    const inputError = {};
    const message = Object.keys(data)
        .map((key) => {
            if (!data[key]) {
                inputError[key] = INPUT_ERROR.MISSING;
                return MESSAGE.MISSING_INPUT(key);
            }
            return null;
        })
        .filter((item) => item)
        .join(", ");

    return {
        inputError,
        message,
    };
};

export const queryParamToBool = (value) => {
    return (value + "").toLowerCase() === "true";
};
