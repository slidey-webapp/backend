import { models } from "../../database";
const AccountTable = models.Account;
export default AccountTable;

export const ACCOUNT_STATUS = {
    UNVERIFIED: "UNVERIFIED",
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
};

export const ACCOUNT_SOURCE = {
    NORMAL: "normal",
    GOOGLE: "google",
};
