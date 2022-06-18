import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

console.log(GLTFLoader)

// Constants
////////////

const COLORS = {
    background: "white",
    light: "#ffffff",
    // sky: "#aaaaff",
    sky: "#aaaaff",
    ground: "#88ff88"
}

const PI = Math.PI

// Scene
/////////

let size = { width: 0, height: 0 }

const scene = new THREE.Scene()
scene.background = new THREE.Color(COLORS.background)
scene.fog = new THREE.Fog(COLORS.background, 15, 20)

// Renderer
///////////

const renderer = new THREE.WebGLRenderer({
    antialias: true
})

renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.getElementById('canvas-container')
container.appendChild(renderer.domElement)

// Camera
/////////

const camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 100);
camera.position.set(0, 1, 5);
let cameraTarget = new THREE.Vector3(0, 1, 0)

scene.add(camera)

// Lights
/////////

const directionalLight = new THREE.DirectionalLight(COLORS.light, 2)
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2, 5, 3);

scene.add(directionalLight)

const hemisphereLight = new THREE.HemisphereLight(COLORS.sky, COLORS.ground, 0.5)
scene.add(hemisphereLight)

// Floor
////////

const plane = new THREE.PlaneGeometry(100, 100)
const floorMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ground })
const floor = new THREE.Mesh(plane, floorMaterial)
floor.receiveShadow = true
floor.rotateX(-PI * 0.5)
scene.add(floor)

// Loader
/////////

const toLoad = [
    {
        file: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/duck/model.gltf',
        name: 'duck',
        group: new THREE.Group()
    },
    // { file: 'https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/witch/model.gltf', name: 'witch' },
    // { file: './assets/ruby.gltf', name: 'ruby' },
    // { file: 'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/les-paul/model.gltf', name: 'les-paul' },
]

const models = {}

const LoadingManager = new THREE.LoadingManager(() => { })
const gltfLoader = new GLTFLoader(LoadingManager)
toLoad.forEach(item => {
    gltfLoader.load(item.file, (model) => {
        model.scene.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        })
        item.group.add(model.scene)
        scene.add(item.group)
        models[item.name] = item.group
    })
})

// Resize handling
//////////////////

const resizeHandler = () => {
    size.width = container.clientWidth
    size.height = container.clientHeight

    camera.aspect = size.width / size.height
    camera.updateProjectionMatrix()

    renderer.setSize(size.width, size.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', resizeHandler)
resizeHandler()

// Tick
///////

const tick = () => {
    camera.lookAt(cameraTarget)
    renderer.render(scene, camera)
    window.requestAnimationFrame(() => tick())
}

tick()