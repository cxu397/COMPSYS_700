let currentLevel = 1;
let generatedNet;
let patternsCountForFaces = new Array(6).fill(1);

function getRandomPosition(radius) {
    return radius + Math.random() * (256 - 2 * radius);
}

function isOverlapping(newBounds, existingBoundsList) {
    for (let bounds of existingBoundsList) {
        const dx = newBounds.centerX - bounds.centerX;
        const dy = newBounds.centerY - bounds.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < newBounds.radius + bounds.radius) {
            return true;
        }
    }
    return false;
}

function generatePatternForContext(context, patternsCount, existingPatterns) {
    const radius = 50;

    for (let i = 0; i < patternsCount; i++) {
        let centerX, centerY;
        let patternBounds;
        let attempts = 0;

        // Find a position that doesn't overlap
        do {
            centerX = getRandomPosition(radius);
            centerY = getRandomPosition(radius);
            patternBounds = {
                centerX: centerX,
                centerY: centerY,
                radius: radius
            };
            attempts++;
        } while (isOverlapping(patternBounds, existingPatterns) && attempts < 10);

        if (attempts >= 10) {
            // Failed to find a suitable position
            return;
        }

        const choice = Math.floor(Math.random() * 3);
        switch (choice) {
            case 0: // Circle
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                context.stroke();
                break;
            case 1: // Horizontal Line
                context.moveTo(centerX - 25, centerY);
                context.lineTo(centerX + 25, centerY);
                context.stroke();
                break;
            case 2: // Vertical Line
                context.moveTo(centerX, centerY - 25);
                context.lineTo(centerX, centerY + 25);
                context.stroke();
                break;
        }

        // Add this pattern's bounds to the existing patterns list
        existingPatterns.push(patternBounds);
    }
}

function generatePatternCanvasForFace(faceIndex) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = 'black';
    context.lineWidth = 5;

    generatePatternForContext(context, patternsCountForFaces[faceIndex], []);
    
    return canvas;
}

function updateCubePattern(cube) {
    for (let i = 0; i < 6; i++) {
        const patternCanvas = generatePatternCanvasForFace(i);
        const texture = new THREE.CanvasTexture(patternCanvas);
        cube.material[i].map = texture;
        cube.material[i].needsUpdate = true; 
    }
    renderer.render(scene, camera);
}
const aspectRatio = window.innerWidth / (window.innerHeight / 2);


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(11, aspectRatio, 0.1, 1000);
camera.position.x = 8;
camera.position.y = 8;
camera.position.z = 8;
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight/2);
document.body.appendChild(renderer.domElement);

const buttons = [];
for (let i = 0; i < 4; i++) {
    const button = document.createElement('button');
    button.innerText = `Cube ${i + 1}`;
    button.style.margin = '10px';
    document.body.appendChild(button);
    buttons.push(button);
}

const geometry = new THREE.BoxGeometry();
const cubePositions = [
    { x: -3.5, y: -0.2, z: 2 },
    { x: -1.5, y: -0.2, z: 0  },
    { x: 0.5, y: -0.2, z: -2 },
    { x: 2.5, y: -0.2, z: -4 }
];

const cubes = [];

for (let i = 0; i < cubePositions.length; i++) {
    const materials = [
        new THREE.MeshBasicMaterial({ color: 'white' }),
        new THREE.MeshBasicMaterial({ color: 'white' }),
        new THREE.MeshBasicMaterial({ color: 'white' }),
        new THREE.MeshBasicMaterial({ color: 'white' }),
        new THREE.MeshBasicMaterial({ color: 'white' }),
        new THREE.MeshBasicMaterial({ color: 'white' })
    ];
    const cube = new THREE.Mesh(geometry, materials);

    cube.position.x = cubePositions[i].x;
    cube.position.y = cubePositions[i].y;
    cube.position.z = cubePositions[i].z;

    scene.add(cube);

    // Create an outline for the cube
    const edgesGeometry = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 'black', linewidth: 5 });
    const outline = new THREE.LineSegments(edgesGeometry, lineMaterial);
    cube.add(outline);

    cubes.push(cube);
}

// Apply the pattern to all cubes
cubes.forEach(cube => updateCubePattern(cube));


renderer.render(scene, camera);

const netScaleFactor = 0.5;

function generate2DNetForRandomCube() {
    // Select a random cube from the list
    const randomCube = cubes[Math.floor(Math.random() * cubes.length)];

    const canvasSize = 256 * 4 * netScaleFactor;  // Assuming each face is 256x256 and net layout is 4x3
    const faceSize = 256 * netScaleFactor;

    // Create a canvas for the net
    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize / 4 * 3; // Net layout is 4x3
    const context = canvas.getContext('2d');
    
    // Clear the canvas
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Net layout positions for each face in a cube
    const positions = [
        { x: faceSize * 2, y: faceSize },  // Right
        { x: 0, y: faceSize },             // Left
        { x: faceSize, y: 0 },             // Top
        { x: faceSize, y: faceSize * 2 },  // Bottom
        { x: faceSize, y: faceSize },      // Front
        { x: faceSize * 3, y: faceSize }   // Back
    ];

    // Draw each face and its outline
    for (let i = 0; i < 6; i++) {
        const faceTexture = randomCube.material[i].map.image;
        context.drawImage(faceTexture, positions[i].x, positions[i].y, faceSize, faceSize);

        // Draw the outline for this face
        context.strokeStyle = 'black';
        context.lineWidth = 5 * netScaleFactor;  
        context.strokeRect(positions[i].x, positions[i].y, faceSize, faceSize);
    }
    return { canvas: canvas, cube: randomCube };
}

function generate2DNetForCube(cube) {
    const canvasSize = 256 * 4 * netScaleFactor;  // Assuming each face is 256x256 and net layout is 4x3
    const faceSize = 256 * netScaleFactor;

    const canvas = document.createElement('canvas');
    canvas.width = canvasSize;
    canvas.height = canvasSize / 4 * 3; 
    const context = canvas.getContext('2d');
    
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const positions = [
        { x: faceSize * 2, y: faceSize },  // Right
        { x: 0, y: faceSize },             // Left
        { x: faceSize, y: 0 },             // Top
        { x: faceSize, y: faceSize * 2 },  // Bottom
        { x: faceSize, y: faceSize },      // Front
        { x: faceSize * 3, y: faceSize }   // Back
    ];

    for (let i = 0; i < 6; i++) {
        const faceTexture = cube.material[i].map.image;
        context.drawImage(faceTexture, positions[i].x, positions[i].y, faceSize, faceSize);

        context.strokeStyle = 'black';
        context.lineWidth = 5 * netScaleFactor;  
        context.strokeRect(positions[i].x, positions[i].y, faceSize, faceSize);
    }
    return { canvas: canvas, cube: cube };
}

function checkNetsForAllCubes() {
    const nets = [];

    for (let cube of cubes) {
        const net = generate2DNetForCube(cube);
        nets.push(net);
    }

    for (let i = 0; i < nets.length; i++) {
        for (let j = i + 1; j < nets.length; j++) {
            const net1Data = nets[i].canvas.toDataURL();
            const net2Data = nets[j].canvas.toDataURL();

            if (net1Data === net2Data) {
                cubes.forEach(cube => updateCubePattern(cube));
            }
        }
    }
}

function promptUserSelection() {
    generatedNet = generate2DNetForRandomCube();
    document.body.appendChild(generatedNet.canvas);
}

function increaseLevel() {
    currentLevel++;
    for (let i = 0; i < 6; i++) {
        patternsCountForFaces[i]++;
    }
    cubes.forEach(cube => updateCubePattern(cube));
}

checkNetsForAllCubes();
// Start the test by prompting the user for the first selection
promptUserSelection();

for (let i = 0; i < cubes.length; i++) {
    buttons[i].dataset.cubeIndex = i;  // Store the cube index in a data attribute
    buttons[i].addEventListener('click', function(e) {
        const cubeIndex = parseInt(e.target.dataset.cubeIndex, 10);
        if (cubes[cubeIndex] === generatedNet.cube) {
            alert('Correct!');
            increaseLevel();
        } else {
            alert('Incorrect');
            increaseLevel();
        }
        document.body.removeChild(generatedNet.canvas);

        // Regenerate the net after providing an answer
        promptUserSelection();
        checkNetsForAllCubes();

    });
}
window.addEventListener('resize', function() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight/2;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});
