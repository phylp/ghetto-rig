
const colors = {
    STANDARD: '\x1b[0m',
    SUCCESS: '\x1b[32m',
    WARNING: '\x1b[33m',
    ALERT: '\x1b[41m'
};

const catOutput = (color, str2) => {
    return `${color} ${str2} ${colors.STANDARD} \n`
};

const colorize = (label, txt) => {
    console.log(catOutput(label, txt));
}

module.exports.colorize =  colorize;
module.exports.colors = colors;