const Vimeo = require('./Vimeo');
const Youtube = require('./Youtube');

const validators = [Vimeo, Youtube];

const validate = (url) => {
    const matches = [];

    for(let validator of validators) {
        const valid = validator.check(url);

        if(valid) matches.push(valid);
    }

    if(matches.length === 1) return matches[0];
    return false;
}

module.exports = validate;