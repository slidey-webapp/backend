export const mapUser = (user) => {
    const result = { ...user };
    result.hasPassword = !!user.password;
    delete result.password;
    Object.keys(user).forEach((key) => {
        if (key.includes(".")) {
            delete result[key];
        }
    });
    return result;
};

export const mapUserWithFullname = (user) => {
    const result = { ...user };
    result.fullname = user["Person.fullname"] || "";
    return mapUser(result);
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

export const mapCollaborator = (collaborator) => {
    const result = { ...collaborator };
    delete result.password;
    Object.keys(collaborator).forEach((key) => {
        if (key.includes(".")) {
            delete result[key];
        }
    });
    result.email = collaborator["Account.email"];
    result.fullname = collaborator["Account.Person.fullname"];
    return result;
};
