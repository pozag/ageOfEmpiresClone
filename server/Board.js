const {Entity, Soldier, Archer} = require('./Entity');
const {whatAreTheOdds} = require('./helperFns');

const width = 800;
const height = 800;
const unitSize = 25;

class Board {
    constructor() {
	this.rows = Math.floor(width / unitSize)
	this.cols = Math.floor(height / unitSize);

	this.arr = [];
	for (let i = 0; i < this.rows; i++) {
	    this.arr[i] = [];
	    for (let j = 0; j < this.cols; j++) {
		this.arr[i][j] = whatAreTheOdds(.3) ? 'm' : 'l';
	    }
	}
    }
}

module.exports = Board;
