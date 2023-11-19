export const isNonEmptyArray = (arr) => !!arr && Array.isArray(arr) && arr.length !== 0;

export const isNonEmptyObject = (obj) => !!obj && !Array.isArray(obj) && typeof obj === 'object' && Object.keys(obj).length !== 0;

export const isNonEmptyString = (str) => typeof str === 'string' && !!(str.trim());

export const isValidNumber = (num) => (!!num || num === 0) && typeof num === 'number';

export const isFiniteNumber = (num) => isValidNumber(num) && isFinite(num);

export const isBool = (bool) => typeof(bool) === "boolean";