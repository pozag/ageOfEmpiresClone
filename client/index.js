import React from 'react';
import ReactDOM from 'react-dom';
import history from './history'
import {Router, Switch, Route} from 'react-router-dom';
import {Login, Lobby, Room} from './components';
import socket from './socket';

const setSocketUsername = async name => {
    await socket.emit('new user', name);
    await localStorage.setItem('username', name);
    socket.username = name;
    history.push('/lobby');
}

const App = () => {
    const [username, setUsername] = React.useState(localStorage.getItem('username'));

    React.useEffect(() => {
	setSocketUsername(username);
    }, [username]);
    
    if (!username)
	return <Login setUsername={setUsername} />;

    return (
	<React.Fragment>
	    <Switch>
		<Route path='/login' component={Login} />
		<Route path='/lobby' component={Lobby} />
		<Route path='/room/:id' component={Room} />
		<Route component={Login} />
	    </Switch>
	</React.Fragment>	
    );
}

ReactDOM.render(
    <Router history={history}>
	<App />
    </Router>
    , document.getElementById('main')
);
