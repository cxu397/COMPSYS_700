const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const size = 1;

// Rotated Cube to show 3 faces
const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.MeshBasicMaterial({color: 0x00ff00}));
cube.position.x = -2;
cube.rotation.x = Math.PI / 4;
cube.rotation.y = Math.PI / 4;
scene.add(cube);

// Define positions for nets
const netPositions = [
    { x: 2, y: 1.5 },
    { x: 2, y: 0.5 },
    { x: 2, y: -0.5 },
    { x: 2, y: -1.5 },
];

// Correct net for the cube and other dummy nets
const correctNetGeometry = new THREE.Geometry();

// Vertices for the unfolded cube net
correctNetGeometry.vertices = [
    new THREE.Vector3(-size, size, 0),
    new THREE.Vector3(size, size, 0),
    new THREE.Vector3(3 * size, size, 0),
    new THREE.Vector3(-3 * size, -size, 0),
    new THREE.Vector3(-size, -size, 0),
    new THREE.Vector3(size, -size, 0),
    new THREE.Vector3(3 * size, -size, 0),
    new THREE.Vector3(-3 * size, -3 * size, 0),
    new THREE.Vector3(-size, -3 * size, 0),
    new THREE.Vector3(size, -3 * size, 0),
    new THREE.Vector3(3 * size, -3 * size, 0)
];

// Faces for the unfolded cube net
correctNetGeometry.faces = [
    new THREE.Face3(0, 1, 5),
    new THREE.Face3(0, 5, 4),
    new THREE.Face3(1, 2, 6),
    new THREE.Face3(1, 6, 5),
    new THREE.Face3(4, 5, 9),
    new THREE.Face3(4, 9, 8),
    new THREE.Face3(3, 4, 8),
    new THREE.Face3(5, 6, 10),
    new THREE.Face3(5, 10, 9)
];

const nets = [
    correctNetGeometry, 
    new THREE.PlaneGeometry(2 * size, 2 * size), // Incorrect net
    new THREE.CircleGeometry(size, 32),          // Incorrect net
    new THREE.RingGeometry(0.5 * size, size, 32) // Incorrect net
];

nets.forEach((geometry, index) => {
    const net = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xCCCCCC}));
    net.position.set(netPositions[index].x, netPositions[index].y, 0);
    scene.add(net);
    net.name = index === 0 ? "correctNet" : "wrongNet";
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const clickedNet = intersects[0].object;

        if (clickedNet.name === "correctNet") {
            alert("Correct! This is the right net for the cube.");
        } else if (clickedNet.name === "wrongNet") {
            alert("Try again! This isn't the correct net for the cube.");
        }
    }
});

function animate() {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
