exports.validateMobileNumber = (number) => {
    // Regular expression to check if the number contains only digits
    const regex = /^\d+$/;

    return regex.test(number);
};