class BadInputError extends Error {
    constructor(message) {
        super(message);
        this.code = 400;
    }
}

const isValidString = (input, name = "String input", allow_empty = false) => {
    if (!input) throw new BadInputError(`${name} must be provided.`);
    if (typeof input !== "string")
        throw new BadInputError(`${name} is not a string.`);
    if (!allow_empty && input.trim().length === 0)
        throw new BadInputError(`${name} is blank.`);

    return input.trim();
};

const isValidNumber = (num, name = "Number input") => {
    if (typeof num !== "number")
        throw new BadInputError(`${name} is not a number.`);
    if (!(!!num || num === 0))
        throw new BadInputError(`${name} is not a valid number.`);

    return num;
};

const checkEmail = (str) => {
    str = isValidString(str);
    str = str.toLowerCase();
    let [prefix, domain] = str.split("@");

    const prefixRegex = /^[a-zA-Z0-9_.-]+$/;
    const prefixRegex2 = /^[_.-]+$/;
    const domainRegex = /^[a-zA-Z0-9-]+$/;

    if (!prefixRegex.test(prefix))
        throw new BadInputError("Email prefix bad");
    if (prefixRegex2.test(prefix.charAt(prefix.length - 1)))
        throw new BadInputError("Email prefix bad");

    if (!domain) throw new BadInputError("bad email");
    let end;
    [domain, end] = domain.split(".");
    if (!end) throw new BadInputError("bad email");
    if (!domainRegex.test(domain))
        throw new BadInputError("Bad email domain");

    if (!/^[a-zA-Z]+$/.test(end) || end.length < 2)
        throw new BadInputError("Bad email domain");
    return str;
};

export { checkEmail, isValidNumber, isValidString };