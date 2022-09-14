
/**
 * Pads a given string or number with zeros.
 *
 * copied from: https://github.com/ndresx/react-countdown/blob/master/src/utils.ts
 *
 * @export
 * @param {number|string} value Value to zero-pad.
 * @param {number} [length=2] Amount of characters to pad.
 * @returns Left-padded number/string.
 */
export function zeroPad(value: number | string, length: number = 2): string {
    const strValue = String(value);
    if (length === 0) return strValue;
    const match = strValue.match(/(.*?)([0-9]+)(.*)/);
    const prefix = match ? match[1] : '';
    const suffix = match ? match[3] : '';
    const strNo = match ? match[2] : strValue;
    const paddedNo =
        strNo.length >= length
            ? strNo
            : ([...Array(length)].map(() => '0').join('') + strNo).slice(length * -1);
    return `${prefix}${paddedNo}${suffix}`;
}