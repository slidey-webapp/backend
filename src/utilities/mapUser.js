export const mapUser = (user) => {
    const result = { ...user };
    delete result.password;
    Object.keys(user).forEach((key) => {
        if (key.includes(".")) {
            delete result[key];
        }
    });
    return result;
};
