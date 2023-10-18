import dotenv from "dotenv";
dotenv.config();
export const JWT_KEY = "VERY_SECRET_AND_IMPORTANT_KEY";
export const BCRYPT_SALT = 10;
export const CODE_LENGTH = 6;
export const TOKEN_EXPIRES_IN = "8h";
export const REFRESH_TOKEN_EXPIRES_IN = "14d";
export const DEFAULT_LIMIT = 1000;
export const SOCKET_TIMEOUT = 2000;
export const CUSTOMER_ACCESS_TOKEN_HEADER = "access_token";
export const API_STATUS = {
    OK: "OK",
    NOT_FOUND: "NOT_FOUND",
    INTERNAL_ERROR: "INTERNAL_ERROR",
    UNAUTHORIZED: "UNAUTHORIZED",
    DB_ERROR: "DB_ERROR",
    INVALID_INPUT: "INVALID_INPUT",
    EXISTED: "EXISTED",
    TOKEN_EXPIRED: "TOKEN_EXPIRED",
    PERMISSION_DENIED: "PERMISSION_DENIED",
    SEND_EMAIL_ERROR: "SEND_EMAIL_ERROR",
    RECEIVE_EMAIL_ERROR: "RECEIVE_EMAIL_ERROR",
    NOT_VERIFIED: "NOT_VERIFIED",
};

export const HTTP_METHOD = {
    GET: "GET",
    PUT: "PUT",
    DELETE: "DELETE",
    POST: "POST",
};

export const INPUT_ERROR = {
    MISSING: "MISSING",
    INVALID: "INVALID",
    IN_CORRECT: "IN_CORRECT",
    NOT_MATCH: "NOT_MATCH",
    EXISTED: "EXISTED",
    VIOLATE_RULE: "VIOLATE_RULE",
};

export const RESPONSE_CODE = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 403,
    NOT_FOUND: 404,
    FORBIDDEN: 403,
    SUCCESS: 200,
    INTERNAL_SERVER: 500,
};

export const ZERO = 0;
export const EMPTY_STRING = "";

export const COMMON_STATUS = {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};
export const APP_EMAIL = process.env.APP_EMAIL;
export const APP_EMAIL_PASSWORD = process.env.APP_EMAIL_PASSWORD;
export const APP_NAME = process.env.APP_NAME;
export const APP_HOMEPAGE = process.env.APP_HOMEPAGE;
export const APP_LOGO = process.env.APP_LOGO;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
