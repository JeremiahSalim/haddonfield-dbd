import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene() {
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); 
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    document.body.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 15000);
    camera.position.set(0, 60, 150); 

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Ambient Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.3)); 

    const moon = new THREE.DirectionalLight(0xbfdfff, 0.5); 
    moon.position.set(300, 800, 200); 
    moon.castShadow = true;
    moon.shadow.mapSize.width = 1024; 
    moon.shadow.mapSize.height = 1024;
    moon.shadow.camera.near = 1;
    moon.shadow.camera.far = 8000; 
    moon.shadow.camera.left = -2500;
    moon.shadow.camera.right = 2500;
    moon.shadow.camera.top = 2500;
    moon.shadow.camera.bottom = -2500;
    moon.shadow.bias = -0.0005; 
    scene.add(moon);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene, camera, renderer, controls };
}