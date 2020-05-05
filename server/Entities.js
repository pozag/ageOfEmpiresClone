const {Board, Archer, Soldier} = require('./Entity');
const {whatAreTheOdds, rng, findUnit} = require('./helperFns');

const Entities = (num, userId, color, board, controller) => {
    const arr = [];
    for (let i = 0; i < num; i++) {	
	const coord = findUnit(rng(800), rng(800));
	if (board.arr[coord.x][coord.y] !== 'l') {
	    i--;
	    continue;
	}
	const soldier = whatAreTheOdds(.2) ?
			new Archer(coord, color, userId, controller.constant.count) :
			new Soldier(coord, color, userId, controller.constant.count);
	controller.constant.count++;
	arr.push(soldier);
	board.arr[coord.x][coord.y] = soldier;
    }
    return arr;
}

module.exports = Entities;
