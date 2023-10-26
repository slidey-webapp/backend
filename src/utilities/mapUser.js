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

export const mapGroupMember = (groupMember) => {
    const result = {};
    Object.keys(groupMember).forEach((key) => {
        if (key.includes(".")) {
            const split = key.split(".");
            result[split[split.length - 1]] = groupMember[key];
        } else {
            result[key] = groupMember[key];
        }
    });
    return result;
};
