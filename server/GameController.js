const {whatAreTheOdds, rng, findUnit} = require('./helperFns');
const Board = require('./Board');
const Entities = require('./Entities');

class GameController {
    constructor(users) {
	const board = new Board;
	this.constant = {
	    count: 1,
	},
	this.change = {
	    board,
	    entities: Entities(10, users[0], 'blue', board, this)
		.concat(Entities(10, users[1], 'red', board, this)),
	}
	this.constant.count = 20;
    }    

    setEntities(entities) {
	this.change.entities = entities;
    }
    
    findClosestInBounds(target, entity) {
	const inBounds = coord => {
	    return coord.x >= 0 && coord.x < this.change.board.cols &&
		   coord.y >= 0 && coord.y < this.change.board.rows;
	}

	const dist = Math.floor(this.distBetweenPoints(entity.coord, target));
	if (dist === 0)
	    return target;
	
	const visited = new Set;
	const q = [target];
	while (q.length) {
	    const n = q[0];
	    if (!inBounds(n)) {
		q.shift();
		continue;
	    }
	    
	    if (this.change.board.arr[n.x][n.y] === 'l')
		return dist > this.distBetweenPoints(target, n) ? n : entity.coord;
	    
	    const str = JSON.stringify(q[0]); 
	    
	    if (!visited.has(str)) {
		q.push({x: n.x + 1, y: n.y});
		q.push({x: n.x - 1, y: n.y});
		q.push({x: n.x, y: n.y + 1});
		q.push({x: n.x, y: n.y - 1});
	    }

	    visited.add(str);
	    q.shift();
	}	
    }
    
    findPath(entity) {
	const node = (coord, prev = []) => ({
	    coord,
	    prev
	});

	const inBounds = coord => {
	    return coord.x >= 0 && coord.x < this.change.board.cols &&
		   coord.y >= 0 && coord.y < this.change.board.rows &&
		   this.change.board.arr[coord.x][coord.y] === 'l';
	}
	
	const visited = new Set;
	const q = [node(entity.coord)];

	let first = true;
	while (q.length) {
	    const n = q[0];
	    if (n.coord.x === entity.target.x && n.coord.y === entity.target.y) {
		n.prev.push(n.coord);
		n.prev.shift();
		entity.path = n.prev;
		return;
	    }

	    const str = JSON.stringify(q[0].coord); 
	    
	    if (first || !visited.has(str) && inBounds(n.coord)) {
		q.push(node({x: n.coord.x + 1, y: n.coord.y}, [...n.prev, n.coord]));
		q.push(node({x: n.coord.x - 1, y: n.coord.y}, [...n.prev, n.coord]));
		q.push(node({x: n.coord.x, y: n.coord.y + 1}, [...n.prev, n.coord]));
		q.push(node({x: n.coord.x, y: n.coord.y - 1}, [...n.prev, n.coord]));
	    }

	    visited.add(str);
	    q.shift();
	    first = false;
	}	
    }
    
    attack(a, b) {
	b.hp -= a.attack;
	a.currentCooldown = a.attackCooldown;
	if (b.hp <= 0) {
	    b.dead = true;
	    return;
	}
	if (this.distBetweenPoints(a.coord, b.coord) <= b.range) {
	    a.hp -= b.attack;
	    b.currentCooldown = b.attackCooldown;
	    if (a.hp <= 0) {
		a.dead = true;
		return;
	    }
	}
    }

    move(entity) {
	const [board, path] = [this.change.board, entity.path[0]];
	if (board.arr[path.x][path.y] !== 'l')
	    return false;
	
	board.arr[path.x][path.y] = entity;
	board.arr[entity.coord.x][entity.coord.y] = 'l';
	entity.coord = entity.path.shift();
    }

    distBetweenPoints(a, b) {
	const xD = Math.abs(a.x - b.x);
	const yD = Math.abs(a.y - b.y);
	return Math.sqrt(xD * xD + yD * yD);
    }

    getEntityById(id) {
	if (typeof id === 'string')
	    return;
	for (let i = 0; i < this.change.entities.length; i++) {
	    if (this.change.entities[i].id === id)
		return this.change.entities[i];
	}
    }
    
    tick() {
	const board = this.change.board;
	this.change.entities.forEach(entity => {	    
	    if (entity.currentCooldown <= 0) {
		const target = this.getEntityById(entity.targetedEntity);
		if (target &&
		    this.distBetweenPoints(entity.coord, target.coord) <= entity.range) {
		    this.attack(entity, target);
		} else if (entity.path.length) {
		    const path = entity.path[0];
		    if (board.arr[path.x][path.y] === 'l') {
			this.move(entity);
		    } else {
			entity.target = target
				      ? this.findClosestInBounds(target.coord, entity)
				      : this.findClosestInBounds(entity.target, entity);	     
			this.findPath(entity);
			if (entity.path.length)
			    this.move(entity);
		    }
		}
	    }
	    entity.currentCooldown--;
	});
	const arr = [];
	this.change.entities.forEach(ent => {
	    if (ent.dead) {
		board.arr[ent.coord.x][ent.coord.y] = 'l';
		return;		
	    }
	    arr.push(ent);
	});
	this.change.entities = arr;
    } 
}

module.exports = GameController;
