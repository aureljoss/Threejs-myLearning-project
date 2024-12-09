import * as THREE from "three";
import { Object3D } from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { BufferAttribute } from "three";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CANNON from 'cannon';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

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

// Environment Map
// const rgbeLoader= new RGBELoader()
textureLoader.load('./Static/environmentMap/interior_views_cozy_wood_cabin_with_cauldron_and_p.jpg',(environmentMap)=>{
  environmentMap.mapping=THREE.EquirectangularReflectionMapping
  environmentMap.colorSpace = THREE.SRGBColorSpace
  scene.background=environmentMap
  scene.environment=environmentMap
  scene.environmentIntensity = 1
})

//Physics - Cannon.js
const world=new CANNON.World()
world.gravity.set(0, -9.82, 0)

    //Ball object in cannon
    const sphereCannon= new CANNON.Sphere(0.5)
    const bodyCannon= new CANNON.Body({
      mass:1, 
      position: new CANNON.Vec3(0,3,0),
      shape: sphereCannon
    })
    world.addBody(bodyCannon)

    //Cube object in cannon
    const cubeCannon= new CANNON.Sphere(0.5)
    const cubeBodyCannon= new CANNON.Body({
      mass:1, 
      position: new CANNON.Vec3(0,3,0),
      shape: cubeCannon
    })
    world.addBody(cubeBodyCannon)

    //Floor plane in cannon
    const floorShape= new CANNON.Plane()
    const floorBody= new CANNON.Body({
      mass:0, 
      shape:floorShape
    })
    world.addBody(floorBody)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1,0,0),Math.PI*0.5)

    //Contact Material
    const defaultCannonMat= new CANNON.Material('default')
    const defaultContactMaterial= new CANNON.ContactMaterial(defaultCannonMat, defaultCannonMat, 
      {friction:10, restitution:0.7}
    )
    world.defaultContactMaterial=defaultContactMaterial


//Mesh
const sphere= new THREE.Mesh(
  new THREE.SphereGeometry(0.5,32,16),
  new THREE.MeshBasicMaterial({ color: 'white' })
)
sphere.position.set(0,3,0)

const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial(meshMaterial)
);

mesh.position.set(1, 0, 0);
mesh.rotation.x = Math.PI * 0.25;
mesh.castShadow=true
mesh.receiveShadow=true

const cube1 = new THREE.Mesh(
  new THREE.OctahedronGeometry(1,1),
  new THREE.MeshNormalMaterial()
);
cube1.position.set(-1, 0, 0);
cube1.castShadow=true
cube1.receiveShadow=true

const plane= new THREE.Mesh(
  new THREE.PlaneGeometry(10,10), 
  new THREE.MeshStandardMaterial({map:colorGround, side:THREE.DoubleSide})
)
plane.rotation.x=Math.PI*0.5
plane.receiveShadow=true

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

//Import Models
let mixer=null
const gltfLoader= new GLTFLoader()
const dracoLoader = new DRACOLoader()

  //Lantern model
gltfLoader.load(
  './Static/models/Lantern/glTF/Lantern.gltf',
  (gltf) =>
  {   
      gltf.scene.scale.set(0.2, 0.2, 0.2)
      scene.add(gltf.scene)
  }
)
  //Fox Model
  let foxModel=null
  gltfLoader.load(
    './Static/models/Fox/glTF/Fox.gltf',
    (gltf) =>
    {   
        foxModel=gltf.scene
        foxModel.scale.set(0.02, 0.02, 0.02)
        scene.add(gltf.scene)
        //Load animations from the gltf model
        mixer= new THREE.AnimationMixer(gltf.scene)
        const action= mixer.clipAction(gltf.animations[1])
        action.play()
    }
  )

//Lapi Model
let lapiModel=null
dracoLoader.setDecoderPath('./Static/draco/')
gltfLoader.setDRACOLoader(dracoLoader)
gltfLoader.load(
  './Static/models/Lapi/Lapi.gltf',
  (gltf) =>
  {   
    lapiModel=gltf.scene
    lapiModel.position.set(4,0,4)
    scene.add(gltf.scene)
    console.log(lapiModel)
  }
)

//Mouse
const mouse = new THREE.Vector2()

window.addEventListener('mousemove', (event) =>
{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
})

  //Raycaster
  const raycaster= new THREE.Raycaster()
  let currentIntersect = null

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
camera.position.y=3;

//Lights
const directionalLight= new THREE.DirectionalLight('white', 5)
const spotLight = new THREE.SpotLight('white', 40, 8, Math.PI*0.1, 0.25, 1)
spotLight.position.set(2,3,0)
const spotLightHelper= new THREE.SpotLightHelper(spotLight)
spotLight.castShadow=true
const ambientLight= new THREE.AmbientLight('blue',2)

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
scene.add(groupCubes, camera, meshBuffer, directionalLight, plane,spotLight,spotLightHelper,sphere,ambientLight);

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

const cube1Tweaks = gui.addFolder("Octahedron Tweaks");
const debugObject = {};
debugObject.spin = () => {
  gsap.to(cube1.rotation, { duration: 1, y: cube1.rotation.y + Math.PI * 2 });
};
cube1Tweaks.add(debugObject, "spin").name("Spin Octahedron");
debugObject.push=()=>{
  bodyCannon.applyLocalForce(new CANNON.Vec3(1, 0, 0), new CANNON.Vec3(0, 0, 0))
}
gui.add(debugObject,"push").name('Push Sphere')

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
renderer.shadowMap.enabled=true

renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
let oldElapsedTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - oldElapsedTime
  oldElapsedTime = elapsedTime
  // Update physics (cannon.js)
  world.step(1 / 60, deltaTime, 3)
  sphere.position.copy(bodyCannon.position)
  //Raycaster
  raycaster.setFromCamera(mouse,camera)
  //Load animation from gltf model
  if (mixer){
    mixer.update(deltaTime/2)
  }
  if(foxModel){
    foxModel.position.x=- Math.sin(elapsedTime*0.3)*4
    foxModel.position.z=- Math.cos(elapsedTime*0.3)*4
    foxModel.rotation.y=Math.PI*elapsedTime*0.04;
      //Intersect with model
    const modelIntersect=raycaster.intersectObject(foxModel)
    if(modelIntersect.length)
      {
          if(!currentIntersect)
          {
              console.log('mouse enter')
          }
  
          currentIntersect = modelIntersect
      }
      else
      {
          if(currentIntersect)
          {
              console.log('mouse leave')
          }
          
          currentIntersect = null
      }
    
  }
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
