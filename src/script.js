import * as THREE from "three";
import { Object3D } from "three";
import gsap from 'gsap';

//Mesh
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);
mesh.position.set(1, 0, 0);
mesh.rotation.x = Math.PI * 0.25;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "blue" })
);
cube1.position.set(-1, 0, 0);

//Sets up basic sizes
const sizes = {
  width: 800,
  height: 600,
};

//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;

//Group
const groupCubes = new THREE.Group();
groupCubes.add(cube1, mesh);
groupCubes.position.y = 1;

//Look at this!
camera.lookAt(cube1.position);

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Scene
const scene = new THREE.Scene();
scene.add(groupCubes, camera);

//Axes helper
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

//Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    //Update objects
    groupCubes.rotation.y=Math.sin(elapsedTime)
    groupCubes.rotation.x=Math.cos(elapsedTime)
    //render
    renderer.render(scene, camera);
    //Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()
