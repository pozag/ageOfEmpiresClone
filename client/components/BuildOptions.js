import React from 'react';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
    card: {
	height: '50px',
	width: '30px',
	border: '1px solid black',
	display: 'flex',
	flexDirection: 'column',
    }
});

const BuildingCard = ({name}) => {
    return (
	<div>
	    <div>Image</div>
	    <div>holder
		<h5>{name}</h5>
		<div>price</div>
	    </div>
	</div>
    );
}

const BuildOptions = () => {
    return (
	<React.Fragment>
	    <BuildingCard name='Barracks' />
	    <BuildingCard name='Granary' />	    
	</React.Fragment>
    );
}

export default BuildOptions;
