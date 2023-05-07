const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeWidth = 1;
const cubeHeight = 1;
const gridSize = 5;
const colors = [0x00ff00]; // Define some colors to use for highlighting the cubes

let level = 1; // Initialize the level variable to 1

const cubes = []; // Store all the cubes in an array


// Create grid of cubes
for (let row = 0; row < gridSize; row++) {
  for (let col = 0; col < gridSize; col++) {
    const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cube = new THREE.Mesh(geometry, material);

    // Position cube in grid
    cube.position.x = (col - gridSize / 2 + 0.5) * cubeWidth;
    cube.position.y = (row - gridSize / 2 + 0.5) * cubeHeight;

    cubes.push(cube); // Add the cube to the array of cubes
    scene.add(cube);
  }
}

const highlightedCubes = []; // Store the sequence of highlighted cubes in an array

function highlightCubes() {
    let delay = 1000; // Set the delay to 1000 milliseconds (1 second) between highlighting each cube
  
    // Clear the highlighted cubes array for the new level
    highlightedCubes.length = 0;
  
    for (let i = 0; i < level; i++) {
      const randomIndex = Math.floor(Math.random() * cubes.length);
      const cube = cubes[randomIndex];
      const colorIndex = Math.floor(Math.random() * colors.length);
      setTimeout(() => {
        cube.material.color.set(colors[colorIndex]);
        setTimeout(() => {
          cube.material.color.set(0xffffff);
        }, delay / 2); // Add a delay before resetting the color to white
        highlightedCubes.push(cube);
      }, delay * i); // Set a delay that increases by the delay value multiplied by the index of the cube in the sequence
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

  // Raycast from camera to scene
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  // Check if cube was clicked
  for (const intersect of intersects) {
    if (intersect.object instanceof THREE.Mesh) {
      // Check if the clicked cube is the correct one in the sequence
      if (intersect.object === highlightedCubes[0]) {
        highlightedCubes.shift();
       
        if (highlightedCubes.length === 0) { // If all the highlighted cubes have been clicked, increase the level and generate a new sequence
          level++;
          highlightedCubes.length = 0;
         
          highlightCubes();
        }
      } else {
        // The clicked cube is incorrect, reset the game
        resetGame();
      }
        }
        }
    }
        
   function resetGame() {
  level = 1; // Reset the level to 1
  highlightedCubes.length = 0; // Clear the highlighted cubes array
  // Remove all the cubes from the scene
  for (const cube of cubes) {
    scene.remove(cube);
  }

  // Remove all the cubes from the cubes array
  cubes.splice(0, cubes.length);

  // Create a new grid of cubes
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const geometry = new THREE.BoxGeometry(cubeWidth, cubeHeight, cubeWidth);
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const cube = new THREE.Mesh(geometry, material);

      // Position cube in grid
      cube.position.x = (col - gridSize / 2 + 0.5) * cubeWidth;
      cube.position.y = (row - gridSize / 2 + 0.5) * cubeHeight;

      cubes.push(cube); // Add the cube to the array of cubes
      scene.add(cube);
    }
  }

  highlightCubes(); // Start a new game
}

              
        
document.addEventListener('click', onMouseClick);
        
    function animate() {
        requestAnimationFrame(animate);
        
        renderer.render(scene, camera);
    }
        
        // Position camera
        camera.position.z = 5;
        
        highlightCubes(); // Start the game by highlighting one cube
        
        animate();
