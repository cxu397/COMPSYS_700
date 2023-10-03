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
    context.lineWidth = 2;

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

document.getElementById("increaseLevelButton").addEventListener("click", function() {
    currentLevel++;
    for (let i = 0; i < 6; i++) {
        patternsCountForFaces[i]++;
    }
    cubes.forEach(cube => updateCubePattern(cube));
});

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 8;
camera.position.y = 8;
camera.position.z = 8;
camera.lookAt(scene.position);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
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
    { x: -3, y: 1.5, z: 2 },
    { x: -1, y: 1.5, z: 0  },
    { x: 1, y: 1.5, z: -2 },
    { x: 3, y: 1.5, z: -4 }
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


function generate2DNetForRandomCube() {
    // Select a random cube from the list
    const randomCube = cubes[Math.floor(Math.random() * cubes.length)];

    const canvasSize = 256 * 4;  // Assuming each face is 256x256 and net layout is 4x3
    const faceSize = 256;

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
        { x: faceSize, y: 0 },          // Top
        { x: 0, y: faceSize },          // Left
        { x: faceSize, y: faceSize },   // Front
        { x: faceSize * 2, y: faceSize }, // Right
        { x: faceSize * 3, y: faceSize }, // Back
        { x: faceSize, y: faceSize * 2 }  // Bottom
    ];

    // Draw each face and its outline
    for (let i = 0; i < 6; i++) {
        const faceTexture = randomCube.material[i].map.image;
        context.drawImage(faceTexture, positions[i].x, positions[i].y, faceSize, faceSize);

        // Draw the outline for this face
        context.strokeStyle = 'black';
        context.lineWidth = 5;  // Adjust as needed
        context.strokeRect(positions[i].x, positions[i].y, faceSize, faceSize);
    }

    return { canvas: canvas, cube: randomCube };
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

// Start the game by prompting the user for the first selection
promptUserSelection();

for (let i = 0; i < cubes.length; i++) {
    buttons[i].dataset.cubeIndex = i;  // Store the cube index in a data attribute
    buttons[i].addEventListener('click', function(e) {
        const cubeIndex = parseInt(e.target.dataset.cubeIndex, 10);
        if (cubes[cubeIndex] === generatedNet.cube) {
            alert('Correct!');
            increaseLevel();
        } else {
            alert('Try again!');
        }
        document.body.removeChild(generatedNet.canvas);

        // Regenerate the net after providing an answer
        promptUserSelection();
    });
}
window.addEventListener('resize', function() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
});
