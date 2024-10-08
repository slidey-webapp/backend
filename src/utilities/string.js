export const generateCode = (n = 6) => {
    // Define characters to use in the random string
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    let result = "";

    for (let i = 0; i < n; i++) {
        // Select a random character from the characters string
        const randomIndex = Math.floor(Math.random() * characters.length);

        // Append the selected character to the result
        result += characters.charAt(randomIndex);
    }

    return result;
};

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
export const getInsensitiveCaseRegextForSearchLike = (keyword) => {
    return "(?i).*" + escapeRegExp(keyword) + ".*";
};

const MAX = 100000;

export const getCode = async (isExistedCode, n = 8) => {
    let code = generateCode(n);
    let i = 0;
    while (i < MAX) {
        const isFound = await isExistedCode(code);
        if (!isFound) {
            return code;
        }
        i++;
        code = generateCode(n);
    }
    return null;
};
