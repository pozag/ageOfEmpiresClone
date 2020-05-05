const rng = num => Math.floor(Math.random() * num)
const whatAreTheOdds = odds => Math.random() <= odds;

const findUnit = (x, y) => ({x: Math.floor(x / 25), y: Math.floor(y / 25)});

module.exports = {rng, whatAreTheOdds, findUnit};

