import * as THREE from 'three'

//Mesh
const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color: 'red'}) )
mesh.position.set(1,0,0)
mesh.rotation.x=Math.PI*0.25

//Sets up basic sizes
const sizes={
    width: 800, 
    height:600
}

//Camera
const camera = new THREE.PerspectiveCamera(70, sizes.width/sizes.height)
camera.position.z=3

//Look at this!
camera.lookAt(mesh.position)

//Canvas
const canvas= document.querySelector('canvas.webgl')

//Scene
const scene = new THREE.Scene()
scene.add(mesh, camera)

//Axes helper
const axesHelper=new THREE.AxesHelper(2)
scene.add(axesHelper)

//Renderer
const renderer= new THREE.WebGLRenderer({
    canvas:canvas
})

renderer.setSize(sizes.width, sizes.height)
renderer.render(scene, camera)