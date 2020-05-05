import React from 'react';
import socket from '../socket';
import history from '../history';
import BuildOptions from './BuildOptions';

const unitSize = 25;
const offset = unitSize / 2;

const findUnit = (x, y) => ({x: Math.floor(x / 25), y: Math.floor(y / 25)});

class Mouse {
    constructor() {
	this.mouseDown = false;	
	this.xDown = null;
	this.yDown = null;	
	this.xCurr = null;
	this.yCurr = null;
    }
}

class Canvas extends React.Component {
    constructor(props) {
	super(props);

	this.room = props.id;
	
	this.state = {
	    canvas: null,
	    ctx: null,
	};
	this.interval;
	this.controller = props.controller;
	this.selected = [];
	
	this.mouse = new Mouse;	
	
	this.setCanvas = this.setCanvas.bind(this);
	this.tick = this.tick.bind(this);
	this.mouseUpHandler = this.mouseUpHandler.bind(this);
	this.mouseMoveHandler = this.mouseMoveHandler.bind(this);
	this.move = this.move.bind(this);
	this.findClosestInBounds = this.findClosestInBounds.bind(this);
	this.findPath = this.findPath.bind(this);
	this.select = this.select.bind(this);
	this.checkInSelect = this.checkInSelect.bind(this);
	
	socket.on('send game state', change => {
	    this.controller.change = change;
	})
    }

    checkInSelect(entity, x1, x2, y1, y2) {
	const [smallX, bigX] = x1 < x2 ? [x1, x2] : [x2, x1];
	const [smallY, bigY] = y1 < y2 ? [y1, y2] : [y2, y1];
    
	return smallX <= entity.coord.x * unitSize && entity.coord.x * unitSize <= bigX
	    && smallY <= entity.coord.y * unitSize && entity.coord.y * unitSize <= bigY;
    }

    distBetweenPoints(a, b) {
	const xD = Math.abs(a.x - b.x);
	const yD = Math.abs(a.y - b.y);
	return Math.sqrt(xD * xD + yD * yD);
    }

    move() {
	const board = this.controller.change.board;
	const entities = this.controller.change.entities;
	let target = findUnit(this.mouse.xCurr, this.mouse.yCurr);
	const unit = board.arr[target.x][target.y];
	entities.forEach(ent => {
	    if (this.selected.includes(ent.id) && ent.userId === socket.id) {
		target = this.findClosestInBounds(target, ent);
		ent.targetedEntity = typeof unit === 'string' ? unit :
				     unit.userId === ent.userId ? 'l' : unit.id;
		ent.target = target
		this.findPath(ent);
	    }
	});
	socket.emit('move', entities);
    }

    findClosestInBounds(target, entity) {
	const board = this.controller.change.board;

	const inBounds = coord => {
	    return coord.x >= 0 && coord.x < board.cols &&
		   coord.y >= 0 && coord.y < board.rows;
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
	    
	    if (board.arr[n.x][n.y] === 'l')
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
	const board = this.controller.change.board;
	const entities = this.controller.change.entities;

	const node = (coord, prev = []) => ({
	    coord,
	    prev
	});

	const inBounds = coord => {
	    return coord.x >= 0 && coord.x < board.cols &&
		   coord.y >= 0 && coord.y < board.rows &&
		   board.arr[coord.x][coord.y] === 'l';
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

    select(userId) {
	const entities = this.controller.change.entities;
	const {xDown, xCurr, yDown, yCurr} = this.mouse;
	const arr = [];
	entities.forEach(ent => {
	    if (ent.userId === userId && this.checkInSelect(ent, xDown, xCurr, yDown, yCurr))
		arr.push(ent.id);
	});
	this.selected = arr;
    }
    
    componentDidMount() {
	this.setState({
	    canvas: this.refs.canvas,
	    ctx: this.refs.canvas.getContext('2d'),
	}, () => {
	    this.interval = window.setInterval(this.tick, 10);
	    this.setCanvas();
	});
    }

    componentWillUnmount() {
	window.clearInterval(this.interval);
	socket.off('send game state');
	socket.emit('exit room');
	window.removeEventListener('mouseup', this.mouseUpHandler);
	window.removeEventListener('mousemove', this.mouseMoveHandler);
    }

    drawEntities() {
	const {entities} = this.controller.change;

	entities.forEach(entity => this.drawEntity(entity, this.selected.includes(entity.id)))
	    /* if (this.selected.includes(entity.id)) {
	       ctx.beginPath();
	       ctx.fillStyle = 'white';
	       ctx.arc(entity.coord.x * unitSize + offset,
	       entity.coord.y * unitSize + offset,
	       entity.radius + 2, 0, 2 * Math.PI);
	       ctx.fill();
	       ctx.closePath();
	       }
	       
	       ctx.beginPath();
	       ctx.fillStyle = entity.color;
	       ctx.arc(entity.coord.x * unitSize + offset,
	       entity.coord.y * unitSize + offset,
	       entity.radius, 0, 2 * Math.PI);
	       ctx.fill();
	       ctx.strokeStyle = 'white';
	       ctx.strokeText(
	       entity.hp,
	       entity.coord.x * unitSize - 6 + offset,
	       entity.coord.y * unitSize + 4 + offset,
	       );
	       ctx.closePath();
	       }) */
    }
    
    drawEntity(entity, selected) {
	if (entity.type === 'soldier') {
	    this.drawSoldier(entity.coord.x, entity.coord.y, entity.color, selected);
	} else if (entity.type === 'archer') {
	    this.drawArcher(entity.coord.x, entity.coord.y, entity.color, selected);
	}
    }
    
    drawSoldier(x, y, color, selected) {
	const {ctx} = this.state;

	if (selected) {
	    ctx.beginPath();
	    ctx.font = 'bold 25px Helvetica';
	    ctx.fillStyle = 'white';
	    ctx.fillText(
		'S',
		x * unitSize - 8 + offset,
		y * unitSize + 7 + offset,		
	    );
	    ctx.closePath();
	}

	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.font = 'bold 22px Helvetica';
	ctx.fillText(
	    'S',
	    x * unitSize - 7 + offset,
	    y * unitSize + 6 + offset,
	);
	ctx.closePath();
    }

    drawArcher(x, y, color, selected) {
	const {ctx} = this.state;

	if (selected) {
	    ctx.beginPath();
	    ctx.font = 'bold 25px Helvetica';
	    ctx.fillStyle = 'white';
	    ctx.fillText(
		'A',
		x * unitSize - 8 + offset,
		y * unitSize + 7 + offset,		
	    );
	    ctx.closePath();	    
	}

	ctx.beginPath();	
	ctx.font = 'bold 22px Helvetica';
	ctx.fillStyle = color;
	ctx.fillText(
	    'A',
	    x * unitSize - 7 + offset,
	    y * unitSize + 6 + offset,
	);
	ctx.closePath();
    }

    drawMap() {
	const {ctx, canvas} = this.state;

	ctx.beginPath();
	ctx.fillStyle = 'green';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();

	ctx.beginPath();
	ctx.fillStyle = 'brown';
	for (let i = 0; i < this.controller.change.board.arr.length; i++) {	    
	    for (let j = 0; j < this.controller.change.board.arr.length; j++) {
		if (this.controller.change.board.arr[i][j] === 'm')
		    ctx.rect(i * unitSize, j * unitSize, unitSize, unitSize);
	    }
	}
	ctx.fill();
	ctx.closePath();
    }

    drawGrid() {
	const {ctx, canvas} = this.state;

	ctx.beginPath();
	ctx.strokeStyle = 'black';
	for (let i = 0; i <= this.controller.change.board.arr.length; i++) {
	    ctx.moveTo(0, i * unitSize);
	    ctx.lineTo(canvas.width, i * unitSize);
	    ctx.moveTo(i * unitSize, 0);
	    ctx.lineTo(i * unitSize, canvas.height);
	}
	ctx.stroke();
	ctx.closePath();
    }
    
    drawSelectBox() {
	const {ctx} = this.state;
	if (this.mouse.mouseDown) {	
	    ctx.beginPath();
	    ctx.strokeStyle = 'black';
	    ctx.moveTo(this.mouse.xDown, this.mouse.yDown);
	    ctx.lineTo(this.mouse.xDown, this.mouse.yCurr);
	    ctx.lineTo(this.mouse.xCurr, this.mouse.yCurr);
	    ctx.lineTo(this.mouse.xCurr, this.mouse.yDown);
	    ctx.lineTo(this.mouse.xDown, this.mouse.yDown);
	    ctx.stroke();
	    ctx.closePath();
	};
    }

    tick() {

	this.drawMap();
	this.drawGrid();
	this.drawSelectBox();
	
	this.drawEntities();
    }


    mouseMoveHandler(event) {
	this.mouse.xCurr = event.layerX;
	this.mouse.yCurr = event.layerY;
    }
    
    mouseUpHandler(event) {
	if (event.button === 0) {
	    this.mouse.mouseDown = false;		
	    this.select(socket.id);
	}	
    }
    
    setCanvas() {
	const {canvas, ctx} = this.state;
	const ents = this.controller.change.entities;

	canvas.oncontextmenu = event => {
	    event.preventDefault();
	    this.move();
	};
	
	canvas.addEventListener('mousedown', event => {
	    if (event.button === 0) {
		this.mouse.mouseDown = true;
		this.mouse.xDown = event.layerX;
		this.mouse.yDown = event.layerY;
	    }
	});
	
	window.addEventListener('mouseup', this.mouseUpHandler);	
	window.addEventListener('mousemove', this.mouseMoveHandler);
    }
    
    render() {
	return (
	    <React.Fragment>
		<div onClick={() => history.push('/lobby')}>Back to Lobby</div>
		<canvas ref='canvas' width={800} height={800} />
		{/* <BuildOptions /> */}
	    </React.Fragment>
	);
    }
}

export default Canvas;

