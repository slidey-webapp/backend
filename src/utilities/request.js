import { CUSTOMER_ACCESS_TOKEN_HEADER } from "../config/contants";

export const getToken = (headers) => {
    if (headers && headers.authorization) {
        const parted = headers.authorization.split(" ");
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};
