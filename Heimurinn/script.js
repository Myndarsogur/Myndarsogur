// Grunnstillingar fyrir Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lýsing og bakgrunnur
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Hnöttur
const geometry = new THREE.SphereGeometry(5, 32, 32);
const texture = new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/9/9d/Arctic_Ocean_relief_location_map.png');
const material = new THREE.MeshStandardMaterial({ map: texture });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Smellanlegir punktar
const points = [
  { position: [1, 2, 4], name: "Reykjavík", description: "Höfuðborg Íslands." },
  { position: [-3, -1, 3], name: "Tasiilaq", description: "Bær í Grænlandi." },
  { position: [2, -3, -4], name: "Tuktoyaktuk", description: "Bær í Kanada." }
];

points.forEach(point => {
  const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16);
  const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
  pointMesh.position.set(...point.position);
  pointMesh.userData = { name: point.name, description: point.description };
  scene.add(pointMesh);
});

// Stjórn
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;

// Smelltilvik
document.addEventListener('click', (event) => {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    const object = intersects[0].object;
    if (object.userData.name) {
      alert(`${object.userData.name}: ${object.userData.description}`);
    }
  }
});

// Uppfærsla
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Glugga stærð
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
