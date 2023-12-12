export const mapMessage = (message) => {
    const result = {};
    const sender = {};
    Object.keys(message).forEach((key) => {
        if (key.includes(".")) {
            const split = key.split(".");
            sender[split[split.length - 1]] = message[key];
        } else {
            result[key] = message[key];
        }
    });
    result.sender = sender;
    return result;
};
