const _ = require('lodash');


const K = 1000;
const Ki = 1024;
const BYTE = 8;
const ROUND = 0.5;

const prefixSwitch = {
    k: 1, // Kilo / Kibi 2^10
    m: 2, // Mega / Mebi 2^20
    g: 3, // Giga / Gibi 2^30
    t: 4, // Tera / Tebi 2^40
    p: 5, // Peta / Pebi 2^50
    e: 6, // Exa  / Exbi 2^60
    z: 7, // Zetta / Zebi 2^70
    y: 8, // Yotta / Yobi 2^80
};
const logSwitch = _.concat([''], _.map(_.keys(prefixSwitch), k => `${_.upperCase(k)}iB`));

/**
 * Read and display byte sizes from/to any format.
 * @param {string|number} mixed - The string representation of a file size or the number of bytes
 *      example of valid input: '33.109 MiB', '8bits', 2048, '22.2Gbps', '3TB', '4Tb', '8KiB/sec'
 *      note: Read value rounds to the nearest byte. Nybbles and bits are disregarded.
 *      note: Remember that a lower-case 'b' represents bits, and an uppercase 'B' represents bytes (8 bits)
 *      note: 1KB <> 1KiB. KiB, like MiB, GiB, etc., are base2, and multiples of 1024, while KB, MB, etc., are base10,
 *          and multiples of 1000. Thus, 1 MiB = (2^10)^2 or 1,048,576 bytes, while 1 MB = 1000^2 or 1,000,000 bytes.
 * @returns {{
 *      value: function([{string}=sizeFormat, [{number}=decimalPlaces): {number},
 *      best: function([{string}=formatString): {string}
 * }}
 */
const byteSize = module.exports = (mixed) => {
    return byteSize.createSize(byteSize.parseNum(mixed) || byteSize.parseString(mixed));
};


byteSize.createSize = (bytes) => {
    return bytes && {
            value: (sizeFormat, decimalPlaces=0) => value(bytes, sizeFormat, decimalPlaces),
            best: (formatString='${size}${unit}') => best(bytes, formatString)
        } || null;
};

byteSize.calcSize = (str, num, divide=false) => {
    let base = _.endsWith(_.lowerCase(str), 'i') && Ki || K,
        exp = prefixSwitch[_.lowerCase(str[0])] || 0;

    return divide && num / Math.pow(base, exp) || num * Math.pow(base, exp);
};

byteSize.parseString = (str) => {
    let matches = /^([0-9.]+)(?:\s+|)([ac-rt-zAC-RT-Z]*)(byte|BIT|Bit|b|B|).*$/.exec(str),
        bits = matches && _.includes(['BIT', 'Bit', 'b', 'bit'], matches[3]) ? BYTE : 1;

    return matches && Math.floor(byteSize.calcSize(matches[2], parseFloat(matches[1])) / bits + ROUND);
};

byteSize.parseNum = (str) => {
    return parseInt(str).toString() === str.toString() && parseInt(str);
};

function value(bytes, sizeFormat, decimalPlaces) {
    let matches = sizeFormat && /^([ac-rt-zAC-RT-Z]*)(byte|BIT|Bit|b|B|).*$/.exec(sizeFormat),
        bits = matches && _.includes(['BIT', 'Bit', 'b', 'bit'], matches[2]) ? BYTE : 1,
        offset = matches && Math.pow(10, decimalPlaces),
        size = matches && byteSize.calcSize(matches[1], bytes, true);

    return (sizeFormat && matches) ? Math.floor(size * bits * offset + ROUND) / offset : bytes;
}

function best(bytes, formatString='${size}${unit}') {
    let mag = Math.floor(Math.log2(bytes) / 10),
        off = mag > 0 ? 2 - Math.floor(Math.log10(Math.pow(2, Math.log2(bytes) % 10))) : 0;

    return _.template(formatString)({size: value(bytes, logSwitch[mag], off), unit: logSwitch[mag]});
}
