var screens = [];
var cameraCenter = [0, 0];

function add() {
    var heightFactor = document.getElementById('height').value;
    var widthFactor = document.getElementById('width').value;
    var sizeInInch = document.getElementById('size').value;
    var name = document.getElementById('name').value;

    var screen = new Screen(heightFactor, widthFactor, sizeInInch, name);
    screens.push(screen);
    updateCameraCenter(screen);

    var container = document.getElementById('screenList');
    var item = document.createElement('div');

    // item.innerHTML = '<p class="item">' + screen.describe + '</p>';
    item.className = "item";
    item.innerHTML = screen.describe + '<input type="checkbox" checked="checked" onclick="checkboxOnClick(screens.length - 1)" />';

    container.appendChild(item);

    initObject();
    animate();
}

function Screen(heightFactor, widthFactor, sizeInInch, name) {
    this.heightFactor = heightFactor;
    this.widthFactor = widthFactor;
    this.sizeInInch = sizeInInch;
    this.name = name;
    this.selected = true;

    var singleFactorInMM = (sizeInInch / (Math.pow(Math.pow(heightFactor, 2) + Math.pow(widthFactor, 2), 0.5))) * 25.4;

    this.heightInMM = (heightFactor * singleFactorInMM).toFixed(2);
    this.widthInMM = (widthFactor * singleFactorInMM).toFixed(2);

    this.describe = name + '  ' + heightFactor + ':' + widthFactor + '  ' + sizeInInch + 'Inch' + '  高' + this.heightInMM + 'mm 宽' + this.widthInMM + 'mm';
}

function updateCameraCenter(screen) {
    cameraCenter = [Math.max(cameraCenter[0], screen.widthInMM / 20), Math.max(cameraCenter[1], screen.heightInMM / 20)];

    // camera.position.set(cameraCenter[0], cameraCenter[1], 5);
    // camera.lookAt(new THREE.Vector3(cameraCenter[0], cameraCenter[1], 0));
}

function checkboxOnClick(index) {
    screens[index].selected = !screens[index].selected;

    initObject();
    animate();
}

// --------------------------------------------

var renderer;
var width;
var height;
var compare3DContainer;

function initThree() {
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    compare3DContainer = document.getElementById('compare3D');
    width = compare3DContainer.clientWidth;
    height = compare3DContainer.clientHeight;
    // renderer.setSize(200, 200);
    renderer.setSize(width, height);

    compare3DContainer.appendChild(renderer.domElement);

    renderer.setClearColor(0xFFFFFF, 1.0);
}

var scene;

function initScene() {
    scene = new THREE.Scene();

    // var axes = new THREE.AxisHelper(20);
    // scene.add(axes);
}

var camera;

function initCamera() {
    camera = new THREE.OrthographicCamera(-width / 50, width / 50, -height / 50, height / 50, -200, 200);
    camera.position.set(0, 0, 5);
    scene.add(camera);
}

var light;

function initLight() {
    // light = new THREE.DirectionalLight();
    // light.position.set(2, 5, 3);

    light = new THREE.AmbientLight(0xffffff);

    scene.add(light);
}

var group;

function initObject() {
    if (group !== null) scene.remove(group);

    group = new THREE.Object3D();
    for (var i = 0; i < screens.length; i++) {
        if(screens[i].selected === false) continue;

        var meshWidth = screens[i].widthInMM / 10;
        var meshHeight = screens[i].heightInMM / 10;
        var geometry = new THREE.CubeGeometry(meshWidth, meshHeight, 0.1);

        var material = new THREE.MeshLambertMaterial({
            color: Math.random() * 0xffffff
            , opacity: 0.3
            , transparent: true
            // ,wireframe: true
        });

        var mesh = new THREE.Mesh(geometry, material);

        mesh.position.x = meshWidth / 2;
        mesh.position.y = meshHeight / 2;

        mesh.position.z = i * 0.3;
        mesh.updateMatrix();
        mesh.matrixAutoUpdate = true;

        group.add(mesh);
    }
    group.position.set(cameraCenter[0], cameraCenter[1], 0);

    group.traverse(function (e) {
        e.position.x -= cameraCenter[0];
        e.position.y -= cameraCenter[1];
    });

    scene.add(group);
}

var controls;

function initControls() {
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;

    // controls.minDistance = 100;
    // controls.maxDistance = 500;
    // controls.maxPolarAngle = Math.PI / 2;
}

// --------------------------------------------

function animate() {
    requestAnimationFrame(animate);
    // controls.update();
    render();
}

function render() {
    renderer.render(scene, camera);
}

// --------------------------------------------

var mouseDown = false;
var mx;
var my;

function initMove(evt) {
    mouseDown = true;
    mx = evt.clientX;
    my = evt.clientY;
}

function move(evt) {
    if (mouseDown) {
        group.rotation.y += (evt.clientX - mx) / 10;
        group.rotation.x += (evt.clientY - my) / 10;

        mx = evt.clientX;
        my = evt.clientY;

        render();
    }
}

function stopMove() {
    mouseDown = false;
}

function addController() {
    compare3DContainer.addEventListener('mousedown', initMove);
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stopMove);
}

// --------------------------------------------

function threeStart() {
    initThree();
    initScene();
    initCamera();
    initLight();
    initObject();
    // initControls();

    addController();
    animate();
}



