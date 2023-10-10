import bcrypt from "bcryptjs";

export const comparePassword = async ({ account, password }) => {
    if (account) {
        const isPasswordMatch = await bcrypt.compare(
            password,
            account.password
        );
        return isPasswordMatch;
    }
    return false;
};
