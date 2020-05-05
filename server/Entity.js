class Entity {
    constructor(coord, color, userId, type, id) {
	this.id = id;
	this.coord = coord;
	this.target = {...coord};
	this.color = color;
	this.userId = userId;
	this.currentCooldown = 0;
	this.dead = false;
	this.selected = false;
	this.type = type;
	this.targetedEntity = 0;
	this.path = [];
    }
}

class Soldier extends Entity {
    constructor(coord, color, userId, id) {
	super(coord, color, userId, 'soldier', id);
	this.attackCooldown = 1;
	this.radius = 10;
	this.maxVelocity = 1;
	this.hp = 10;
	this.attack = 1;
	this.range = 1;
    }
}

class Archer extends Entity {
    constructor(coord, color, userId, id) {
	super(coord, color, userId, 'archer', id);
	this.attackCooldown = 2;
	this.radius = 10;
	this.maxVelocity = 1;
	this.hp = 7;
	this.attack = 1;
	this.range = 3;
    }
}

module.exports = {Entity, Soldier, Archer};
