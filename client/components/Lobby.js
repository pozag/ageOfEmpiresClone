import React from 'react';
import socket from '../socket';
import history from '../history';

const newRoom = () => socket.emit('create room');

const leaveRoom = index => socket.emit('leave room', index);
const joinRoom = index => socket.emit('join room', index);

const Lobby = () => {
    let [rooms, setRooms] = React.useState([]);

    React.useEffect(() => {
	socket.emit('get rooms', 'lobby');
	socket.page = 'lobby';
    }, [])

    socket.on('send rooms', data => setRooms(data));

    return (
	<React.Fragment>
	    <h3>Welcome {socket.username}</h3>
	    <div onClick={newRoom}>New Room</div>
	    {rooms.map((room, i) =>
		<div key={i}>
		    <h4>Room {i + 1}:</h4>
		    <div>{room.currUsers} / {room.maxUsers}</div>
		    {room.users.includes(socket.id) ?
		     <div> 
			 <div onClick={() => leaveRoom(i)}>Leave Room</div> 
			 {room.currUsers === room.maxUsers ?
			  <div onClick={() => history.push(`/room/${i + 1}`)}>Enter Room</div> : null}
		    </div>
		    : room.currUsers < room.maxUsers ?
				       <div onClick={() => joinRoom(i)}>Join Room</div> : null}
		</div>
	    )}
	</React.Fragment>
    );
}

export default Lobby;
