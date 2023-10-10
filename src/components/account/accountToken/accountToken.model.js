import { models } from "../../../database";

const AccountTokenTable = models.AccountToken;
export default AccountTokenTable;

export const TOKEN_TYPE = {
    TOKEN: "TOKEN",
    REFRESH_TOKEN: "REFRESH_TOKEN",
};
