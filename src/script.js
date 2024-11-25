import * as THREE from "three";
import { Object3D } from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BufferAttribute } from "three";
import GUI from "lil-gui";

//Materials
const textureLoader = new THREE.TextureLoader();

const meshMaterial=new THREE.MeshStandardMaterial()
const colorGround = textureLoader.load("./Static/textures/cliff_side_diff_1k.jpg");
colorGround.colorSpace = THREE.SRGBColorSpace;
const normalGround = textureLoader.load("./Static/textures/cliff_side_nor_gl_1k.jpg");
const displacementGround=textureLoader.load('./Static/textures/cliff_side_disp_1k.jpg')

meshMaterial.map=colorGround
meshMaterial.normalMap=normalGround
// meshMaterial.displacementMap=displacementGround

colorGround.repeat.x = 2;
colorGround.repeat.y = 3;
colorGround.wrapS = THREE.RepeatWrapping;
colorGround.wrapT = THREE.RepeatWrapping;
colorGround.rotation = Math.PI * 0.25;

//Mesh
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial(meshMaterial)
);

mesh.position.set(1, 0, 0);
mesh.rotation.x = Math.PI * 0.25;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1, 2, 2, 2),
  new THREE.MeshBasicMaterial({ color: "blue", wireframe: true })
);
cube1.position.set(-1, 0, 0);

const plane= new THREE.Mesh(
  new THREE.PlaneGeometry(10,10), 
  new THREE.MeshStandardMaterial({map:colorGround, side:THREE.DoubleSide})
)

plane.rotation.x=Math.PI*0.5

//Buffer Geometry
const bufferGeometry = new THREE.BufferGeometry();
const count = 50;
const positionsArray = new Float32Array(count * 9);
for (let i = 0; i < count * 9; i++) {
  positionsArray[i] = (Math.random() - 0.5) * 4;
}
const positionsAttribute = new THREE.BufferAttribute(positionsArray, 3);
bufferGeometry.setAttribute("position", positionsAttribute);
const materialBufferGeometry = new THREE.MeshBasicMaterial({
  color: "green",
  wireframe: true,
});
const meshBuffer = new THREE.Mesh(bufferGeometry, materialBufferGeometry);

//Sets up basic sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//Handling of screen resizing
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;

//Lights
const directionalLight= new THREE.DirectionalLight('white', 5)

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//Group
const groupCubes = new THREE.Group();
groupCubes.add(cube1, mesh);
groupCubes.position.y = 1;

//Look at this!
camera.lookAt(cube1.position);

//Scene
const scene = new THREE.Scene();
scene.add(groupCubes, camera, meshBuffer, directionalLight, plane);

//Axes helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//Debug
const gui = new GUI();

const meshTweaks = gui.addFolder("Mesh Tweaks");
meshTweaks
  .add(mesh.position, "y")
  .min(-10)
  .max(10)
  .step(0.01)
  .name("Mesh Elevation");
meshTweaks.add(mesh, "visible").name("is Mesh Visible?");
meshTweaks
  .addColor(materialBufferGeometry, "color")
  .name("Buffer Geometry Color");

const cube1Tweaks = gui.addFolder("Cube1 Tweaks");
const debugObject = {};
debugObject.spin = () => {
  gsap.to(cube1.rotation, { duration: 1, y: cube1.rotation.y + Math.PI * 2 });
};
cube1Tweaks.add(debugObject, "spin").name("Spin Red Cube");

debugObject.subdivision = 2;
gui
  .add(debugObject, "subdivision")
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(() => {
    cube1.geometry.dispose();
    cube1.geometry = new THREE.BoxGeometry(
      1,
      1,
      1,
      debugObject.subdivision,
      debugObject.subdivision,
      debugObject.subdivision
    );
  });

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  //Update objects
  groupCubes.rotation.y = Math.sin(elapsedTime);
  groupCubes.rotation.x = Math.cos(elapsedTime);
  //Update controls
  controls.update();
  //render
  renderer.render(scene, camera);
  //Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
tick();
