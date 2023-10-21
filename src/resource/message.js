export const UNAUTHORIZED = "Unauthorized";
export const NOT_FOUND_ACCOUNT = "Not found any matched account!";
export const INCORRECT_PASSWORD = "Password incorrect";
export const BLOCKED_ACCOUNT = "Your account has been blocked";
export const SEND_VERIFY_EMAIL = (email) =>
    `A verification email has been sent to ${email}. Please check your inbox (or spam folder) and follow the instructions.`;
export const QUERY_SUCCESS = (name) => `Query ${name || "data"} success`;
export const EXISTED_USER = "Username existed";
export const EXISTED_GROUP = "Group's name existed";
export const EXISTED_EMAIL = "Email existed";
export const EXISTED_PRESENTATION =
    "Presentation with this name already exists";
export const MISSING_INPUT = (input) => `${input} cant be empty`;
export const POST_SUCCESS = (action) => `${action} success`;
export const QUERY_NOT_FOUND = (name) => `Not found any ${name}`;
export const INVALID_INPUT = (name) => `invalid ${name}`;
export const PERMISSION_NOT_FOUND =
    "You dont have permission to do this action";
export const SEND_EMAIL_SUCCESS = "Email sent successfully!";
export const AUTHENTICATE_FAILED = "AUTHENTICATE_FAILED";
export const PASSWORD_NOT_MATCH =
    "Confirm password and password are not the same";
export const VERIFY_MAIL_SUBJECT = "Verify account";
export const VERIFY_MAIL_CONTENT = (link) =>
    `Plese verify your account email by clicking the link bellow: \n ${link}`;
