export const generateCode = (n = 6) => {
    // Define characters to use in the random string
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < n; i++) {
        // Select a random character from the characters string
        const randomIndex = Math.floor(Math.random() * characters.length);

        // Append the selected character to the result
        result += characters.charAt(randomIndex);
    }

    return result;
};
