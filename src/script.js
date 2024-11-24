import * as THREE from "three";
import { Object3D } from "three";
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import { BufferAttribute } from "three";

//Mesh
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: "red" })
);
mesh.position.set(1, 0, 0);
mesh.rotation.x = Math.PI * 0.25;

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1,2,2,2),
  new THREE.MeshBasicMaterial({ color: "blue", wireframe:true})
);
cube1.position.set(-1, 0, 0);

//Buffer Geometry
const geometry= new THREE.BufferGeometry()
const count = 50
const positionsArray= new Float32Array(count *9)
for (let i=0; i<count *9; i++){
  positionsArray[i]=(Math.random()-0.5)*4
}
const positionsAttribute= new THREE.BufferAttribute(positionsArray, 3)
geometry.setAttribute('position', positionsAttribute)
const materialGeometry= new THREE.MeshBasicMaterial({color: 'green', wireframe:true})
const meshBuffer= new THREE.Mesh(geometry, materialGeometry)

//Sets up basic sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};


//Handling of screen resizing
window.addEventListener('resize', () =>
  {
      // Update sizes
      sizes.width = window.innerWidth
      sizes.height = window.innerHeight
  
      // Update camera
      camera.aspect = sizes.width / sizes.height
      camera.updateProjectionMatrix()
  
      // Update renderer
      renderer.setSize(sizes.width, sizes.height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })


//Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
camera.position.z = 3;

//Canvas
const canvas = document.querySelector("canvas.webgl");

//Controls
const controls= new OrbitControls(camera, canvas)
controls.enableDamping=true;

//Group
const groupCubes = new THREE.Group();
groupCubes.add(cube1, mesh);
groupCubes.position.y = 1;

//Look at this!
camera.lookAt(cube1.position);

//Scene
const scene = new THREE.Scene();
scene.add(groupCubes, camera, meshBuffer);

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
    //Update controls
    controls.update()
    //render
    renderer.render(scene, camera);
    //Call tick again on the next frame
    window.requestAnimationFrame(tick)
}
tick()
