var game, socket;
var stats;

var camera, scene, renderer, timer;

var init = function()
{
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
    scene.add( camera );

    timer = new THREE.Clock();

    renderer = new THREE.WebGLRenderer( { alpha: true } );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    window.addEventListener( "resize", onWindowResize, false );

    stats = new Stats();
    stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( stats.dom );
};

var onWindowResize = function()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
};

var start = function()
{
    timer.start();
};

var animate = function()
{
    requestAnimationFrame( animate );

    var delta = timer.getDelta();

    stats.begin();

    game.update( delta );
    InputManager.update();

    if ( game.mustRender() )
    {
        renderer.render( scene, camera );
    }

    stats.end();
};


init();
game = new Game( { } );
start();
animate();
