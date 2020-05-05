import React from 'react';
import socket from '../socket';
import {useParams} from 'react-router-dom';
import history from '../history';
import {Canvas} from './';

const Room = () => {

    let [room, setRoom] = React.useState({
	users: [],
	board: {},
	maxUsers: 0,
	currUsers: 0,
	entities: [],
    });

    const [id] = React.useState(useParams().id - 1)
    
    React.useEffect(() => {	
	socket.emit('get room', id);
	socket.page = `room ${id}`;

	return () => socket.off('send room');
    }, []);

    socket.on('send room', async data => {
	setRoom({...data});	
    });
    
    if (!room.users.length) return <div>Loading</div>
    
    return (
	<Canvas {...room} id={id} />
    );
}


export default Room;
