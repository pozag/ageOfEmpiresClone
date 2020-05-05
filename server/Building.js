const {Entity}  = require('./models');

class Building extends Entity {
    constructor(x, y, color, userId) {
	super(x, y, color, userId, 'building');
	this.perimiter = 60;
	this.hp = 40;
	this.shape = 'rect';
    }
}

module.exports = Building;

