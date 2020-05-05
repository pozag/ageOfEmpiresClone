import React from 'react';
import {Link} from 'react-router-dom';
import socket from '../socket';
import history from '../history';

const Login = ({setUsername}) => {
    const [name, setName] = React.useState('');

    const onPress = () => {
	submit(name);
	setUsername(name);
    }
    
    return (
	<React.Fragment>
	    <input onChange={event => setName(event.target.value)} />
	    <div onClick={onPress}>Submit</div>
	</React.Fragment>
    );
};

export default Login;
