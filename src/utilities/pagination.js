import { DEFAULT_LIMIT, DEFAULT_OFFSET } from "../config/contants";

export const getPaginationInfo = (req) => {
    const result = {
        offset: DEFAULT_OFFSET,
        limit: DEFAULT_LIMIT,
        getTotal: true,
    };
    if (!req || !req.query) {
        return result;
    }

    const page = req.query.page || DEFAULT_OFFSET + 1;
    const limit = req.query.limit || DEFAULT_LIMIT;
    const getTotal = !!req.query.getTotal || false;

    result.offset = (page - 1) * limit;
    result.limit = limit;
    result.getTotal = getTotal;

    return result;
};
