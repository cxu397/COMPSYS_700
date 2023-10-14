const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeWidth = 0.7; // Adjust cube width to make it smaller
const cubeHeight = 0.7; // Adjust cube height to make it smaller
const gridSize = 7; // Increase grid size to 7x7
const colors = [0x00ff00]; // Define some colors to use for highlighting the cubes

let level = 1; // Initialize the level variable to 1

const cubes = []; // Store all the cubes in an array

// Create grid of cubes
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth);

    // Create a material for the cube sides (white color)
    const materialSides = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create a material for the cube edges (black color)
    const materialEdges = new THREE.LineBasicMaterial({ color: 0x000000 });

    // Create a group to hold both the cube sides and edges
    const cubeGroup = new THREE.Group();

    // Create the cube sides
    const cubeSides = new THREE.Mesh(geometry, materialSides);
    cubeGroup.add(cubeSides);

    // Create the cube edges
    const cubeEdges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), materialEdges);
    cubeGroup.add(cubeEdges);

    // Position cube in grid
    cubeGroup.position.x = (col - gridSize / 2 + 0.5) * cubeWidth;
    cubeGroup.position.y = (row - gridSize / 2 + 0.5) * cubeHeight;

    cubes.push(cubeGroup); // Add the cube group to the array of cubes
    scene.add(cubeGroup);
  }
}

const highlightedCubes = []; // Store the sequence of highlighted cubes in an array
const highlightedMeshes = []; // Store the meshes of the highlighted cubes

function highlightCubes() {
  let delay = 1000; // Set the delay to 1000 milliseconds (1 second) between highlighting each cube

  // Clear the highlighted cubes array for the new level
  highlightedCubes.length = 0;
  highlightedMeshes.length = 0;

  // Generate a random starting position for the first cube in the sequence
  const randomStartRow = Math.floor(Math.random() * gridSize);
  const randomStartCol = Math.floor(Math.random() * gridSize);

  let previousRow = randomStartRow;
  let previousCol = randomStartCol;

  for (let i = 0; i < level; i++) {
    // Calculate the valid next position
    let validNextRow, validNextCol;
    do {
      validNextRow = Math.floor(Math.random() * gridSize);
      validNextCol = Math.floor(Math.random() * gridSize);
    } while (
      (validNextRow === previousRow && validNextCol === previousCol) || // Check if the next position is the same as the previous position
      validNextRow === previousRow || // Check if the next position is in the same row
      validNextCol === previousCol || // Check if the next position is in the same column
      Math.abs(validNextRow - previousRow) <= 1 && Math.abs(validNextCol - previousCol) <= 1 // Check if the next position is around the previous position
    );

    const cubeIndex = validNextRow * gridSize + validNextCol;
    const cube = cubes[cubeIndex];
    const colorIndex = Math.floor(Math.random() * colors.length);

    setTimeout(() => {
      cube.children[0].material.color.set(colors[colorIndex]);
      setTimeout(() => {
        cube.children[0].material.color.set(0xffffff);
      }, delay / 2); // Add a delay before resetting the color to white
      highlightedCubes.push(cube);
      highlightedMeshes.push(cube.children[0]);
    }, delay * i); // Set a delay that increases by the delay value multiplied by the index of the cube in the sequence

    previousRow = validNextRow;
    previousCol = validNextCol;
  }

  const levelElement = document.getElementById('level');

  // Update the level element
  levelElement.textContent = `Level: ${level}`;
}

function onMouseClick(event) {
  // Calculate mouse position in normalized device coordinates
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  // Raycast from camera to highlighted cube meshes only
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(highlightedMeshes);

  if (intersects.length === 0) {
    // If no highlighted cube was clicked, reset the level
    resetLevel();
    return;
  }

  // Check if the first highlighted cube was clicked
  if (intersects[0].object === highlightedMeshes[0]) {
    highlightedCubes.shift();
    highlightedMeshes.shift();

    if (highlightedCubes.length === 0) {
      // If all the highlighted cubes have been clicked, increase the level
      level++;
      highlightCubes();
    }
  } else {
    // The clicked cube is incorrect, reset the level
    resetLevel();
  }
}


function resetLevel() {
  level = 1; // Reset the level to 1
  highlightedCubes.length = 0; // Clear the highlighted cubes array
  highlightedMeshes.length = 0; // Clear the highlighted meshes array

  // Reset the color of all cubes
  for (const cube of cubes) {
    cube.children[0].material.color.set(0xffffff);
  }

  highlightCubes(); // Start a new level
}

document.addEventListener('click', onMouseClick);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

// Position camera
camera.position.z = 5;

highlightCubes(); // Start the level by highlighting one cube

animate();
