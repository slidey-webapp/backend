import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "../config/contants";
import { isStringValidNumber } from "./number";

export const getPaginationInfo = (req) => {
    const result = {
        offset: DEFAULT_OFFSET,
        limit: DEFAULT_LIMIT,
        getTotal: true,
    };
    if (!req || !req.query) {
        return result;
    }

    const offset = isStringValidNumber(req.query.offset) ? parseInt(req.query.offset) : DEFAULT_OFFSET;
    const limit = isStringValidNumber(req.query.limit) ? parseInt(req.query.limit) : DEFAULT_LIMIT;
    const getTotal = !!req.query.getTotal || false;

    result.offset = offset;
    result.limit = limit;
    result.getTotal = getTotal;

    return result;
};
