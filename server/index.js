const path = require('path');
const express = require('express');
const morgan = require('morgan');
const compression = require('compression');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

module.exports = app;

const {Board, GameController, Entities, Room} = require('./models');

const createApp = () => {
    app.use(morgan('dev'));
    
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    
    app.use(compression());
    
    app.use(express.static(path.join(__dirname, '..', 'public')));
    
    app.use((req, res, next) => {
	if (path.extname(req.path).length) {
	    const err = new Error('Not found');
	    err.status = 404;
	    next(err);
	} else {
	    next();
	}
    });
    
    app.use('*', (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'public/index.html'));
    });
    
    app.use((err, req, res, next) => {
	console.error(err);
	console.error(err.stack);
	res.status(err.status || 500).send(err.message || 'Internal server error.');
    });
}

const rooms = [];

const startListening = () => {
    io.on('connection', (socket) => {
	console.log('user connected', socket.id);
	socket.on('new user', data => {
	    console.log('new user');
	    socket.username = data;
	});

	//rooms
	socket.on('get rooms', page => {
	    console.log('get rooms');
	    socket.page = page;
	    socket.emit('send rooms', rooms);
	});
	
	socket.on('create room', data => {
	    console.log('create room');
	    rooms.push(Room());

	    Object.keys(io.sockets.sockets).forEach(el => {
		el = io.sockets.sockets[el];
		el.page === 'lobby' ? el.emit('send rooms', rooms) : null;
	    });
	});
	
	socket.on('leave room', index => {
	    console.log('leave room');
	    rooms[index].users = rooms[index].users.filter(user => user !== socket.id);
	    rooms[index].currUsers--;

	    Object.keys(io.sockets.sockets).forEach(el => {
		el = io.sockets.sockets[el];
		el.page === 'lobby' ? el.emit('send rooms', rooms) : null;
	    });
	});
	
	socket.on('join room', index => {
	    console.log('join room');
	    if (rooms[index].currUsers < rooms[index].maxUsers) {
		rooms[index].users.push(socket.id);
		rooms[index].currUsers++;
	    }

	    Object.keys(io.sockets.sockets).forEach(el => {
		el = io.sockets.sockets[el];
		el.page === 'lobby' ? el.emit('send rooms', rooms) : null;
	    });
	});	
	//rooms

	//room
	socket.on('get room', index => {
	    console.log('get room');
	    socket.page = 'room';
	    socket.room = index;
	    const room = rooms[socket.room];
	    if (!room.controller)
		room.controller = new GameController(room.users);
	    socket.controller = room.controller;
	    if (!socket.room.interval) {
		socket.room.interval = setInterval(() => {
		    room.controller.tick();
		    socket.emit('send game state', room.controller.change);
		}, 500);
	    }
	    socket.emit('send room', room);
	})

	socket.on('exit room', index => {
	    console.log('exit room');
	    socket.room = 'lobby';
	    clearInterval(socket.interval);
	    socket.room.interval = null;
	})
	//room
	
	//game
	socket.on('move', entities => { 
	    console.log('move');
	    socket.controller.setEntities(entities);
	});

	socket.on('select', mouse => {
	    console.log('select');
	    socket.controller.select(mouse, socket.id);
	});
	//game
	
    });
    
    http.listen(3000, () => console.log(`Mixing it up on port 3000`));
} 

async function bootApp() {
    await createApp();
    await startListening();
} 

bootApp();

