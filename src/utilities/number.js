export function isStringValidNumber(str) {
    // Use parseFloat to attempt parsing the string as a floating-point number
    const number = parseFloat(str);

    // Check if the parsed result is a number and not NaN
    return !isNaN(number) && isFinite(number);
}
