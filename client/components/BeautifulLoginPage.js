import React from 'react';
import * as THREE from 'three';

const BeautifulLoginPage = () => {
    React.useEffect(() => {
	init();
//	animate();
    }, []);

    return (
	<React.Fragment />	    
    );
}

let container
let stats;
let camera;
let scene;
let renderer;

function init() {
    const loader = new THREE.TextureLoader();

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // scene

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xcce0ff );
    scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 );

    // camera

    camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set( 1000, 50, 1500 );

    // lights

    scene.add( new THREE.AmbientLight( 0x666666 ) );

    const light = new THREE.DirectionalLight( 0xdfebff, 1 );
    light.position.set( 50, 200, 100 );
    light.position.multiplyScalar( 1.3 );

    light.castShadow = true;

    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;

    const d = 300;

    light.shadow.camera.left = - d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = - d;

    light.shadow.camera.far = 1000;

    scene.add( light );

    var ballGeo = new THREE.SphereBufferGeometry( 60, 32, 16 );
    var ballMaterial = new THREE.MeshLambertMaterial();
    
    const sphere = new THREE.Mesh( ballGeo, ballMaterial );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.visible = true;
    scene.add( sphere );

    const groundTexture = loader.load( '/grasslight-big.jpg' );
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set( 25, 25 );
    groundTexture.anisotropy = 16;
    groundTexture.encoding = THREE.sRGBEncoding;

    const groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

    const mesh = new THREE.Mesh ( new THREE.PlaneBufferGeometry( 20000, 20000), groundMaterial);
    mesh.position.y = -250;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add( mesh );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.shadowMap.enabled = true;

    window.addEventListener( 'resize', onWindowResize, false );

    renderer.render( scene, camera)
}

function render() {
    sphere.position.copy( 20 );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

export default BeautifulLoginPage;
