import * as THREE from 'three'

//scene
const scene = new THREE.Scene()

//Mesh
const mesh=new THREE.Mesh(
    THREE.BufferGeometry(1,1,1),
    THREE.MeshBasicMaterial({color: 'red'}) )

const sizes={
    width: 800, 
    height:600
}

const camera = new THREE.PerspectiveCamera(35, sizes.width/sizes.height)

scene.add(mesh)