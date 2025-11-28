import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sanitizeMaterial } from './Utils.js';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.mixer = null;
        this.sirenSpinner = null;
        
        // Tracking for streetlights to avoid duplicates
        this.createdLightPositions = [];

        // Flicker Logic Vars
        this.flickerTimer = 0;
        this.nextChangeTime = 0;
        this.isLightOn = true;
        this.manualLight = null;
        this.manualBulb = null;

        this.initBrokenLight();
        this.loadCity();
    }

    initBrokenLight() {
        this.manualLight = new THREE.PointLight(0xffffff, 300, 100); 
        this.manualLight.castShadow = true; 
        this.manualLight.shadow.bias = -0.0001; 
        this.scene.add(this.manualLight);

        const manualBulbGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const manualBulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 
        this.manualBulb = new THREE.Mesh(manualBulbGeo, manualBulbMat);
        this.scene.add(this.manualBulb);
    }

    loadCity() {
        const loader = new GLTFLoader();
        loader.load("./assets/complete_detail-v1.glb", (gltf) => {
            const model = gltf.scene;
            model.scale.set(5, 5, 5); 
            model.updateMatrixWorld(true);

            let brokenLightFound = false;
            let sirenCreated = false;

            model.traverse((node) => {
                if (node.isMesh) {
                    const name = node.name.toLowerCase();

                    // 1. 🚔 SIREN LOGIC
                    if (name.includes('chapman73_lightbar')) {
                        node.visible = false;
                        if (!sirenCreated) {
                            this.createSiren(node);
                            sirenCreated = true;
                        }
                        return;
                    }
                    if (name.includes('chapman73_copstuff')) {
                        node.visible = false;
                        return;
                    }

                    // 2. 🎨 MATERIAL & SHADOWS
                    node.material = sanitizeMaterial(node.material);
                    node.receiveShadow = true;
                    node.castShadow = true;

                    const parentName = node.parent ? node.parent.name.toLowerCase() : "";
                    const fullName = name + " " + parentName;
                    let isBrokenLight = false;

                    // 3. 🎃 HALLOWEEN PUMPKIN
                    if (name.includes('pumpkin') && node.material) {
                        node.material.emissive = new THREE.Color(0xffaa00);
                        node.material.emissiveIntensity = 0.5;
                    }

                    // 4. 🔥 BROKEN LIGHT LOGIC (The flickering one)
                    if (name.includes('lamp') && !brokenLightFound) {
                        const lampPos = new THREE.Vector3();
                        node.getWorldPosition(lampPos);
                        this.manualLight.position.set(lampPos.x, lampPos.y + 14, lampPos.z - 22.8);
                        this.manualBulb.position.set(lampPos.x, lampPos.y + 14, lampPos.z - 22.8);
                        node.castShadow = false; 
                        brokenLightFound = true;
                        isBrokenLight = true;
                    }

                    // 5. 💡 NORMAL STREET LIGHT LOGIC (RESTORED!)
                    if ((fullName.includes('lamp') || fullName.includes('parklight')) && !isBrokenLight) {
                        node.castShadow = false;
                        const meshWorldPos = new THREE.Vector3();
                        node.getWorldPosition(meshWorldPos);
                        
                        let zOffset = 0;
                        if (node.name === 'SM_ParkLight01smd003') { zOffset = -0.4; }
                        
                        const targetLightPos = meshWorldPos.clone().add(new THREE.Vector3(0, 3.6, zOffset));

                        let duplicate = false;
                        for(let pos of this.createdLightPositions) {
                            if (targetLightPos.distanceTo(pos) < 50) { 
                                duplicate = true;
                                break;
                            }
                        }

                        if (!duplicate) {
                            this.createdLightPositions.push(targetLightPos);
                            
                            const light = new THREE.PointLight(0xffaa00, 800, 60);
                            light.position.set(0, 3.8, zOffset); 
                            light.castShadow = false; 
                            node.add(light);
                            
                            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffaa00 }));
                            bulb.position.set(0, 3.8, zOffset); 
                            node.add(bulb);
                        }
                    }

                    // 6. 🚧 OBSTACLE GENERATION
                    this.generateObstacle(node, fullName);
                }
            });

            this.scene.add(model);
            if (gltf.animations.length > 0) {
                this.mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => this.mixer.clipAction(clip).play());
            }
        });
    }

    createSiren(node) {
        const barPos = new THREE.Vector3();
        node.getWorldPosition(barPos);
        barPos.y -= 0.4; barPos.z -= 2; barPos.x += 2;

        const tubeMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.3, 0.5, 16),
            new THREE.MeshPhongMaterial({color: 0x888888, transparent: true, opacity: 0.8})
        );
        tubeMesh.position.copy(barPos);
        this.scene.add(tubeMesh);

        this.sirenSpinner = new THREE.Group();
        this.sirenSpinner.position.copy(barPos);
        this.sirenSpinner.position.y += 0.1;
        this.scene.add(this.sirenSpinner);

        const redSpot = new THREE.SpotLight(0xff0000, 200, 100, Math.PI/3, 0.5, 1);
        redSpot.position.set(0.1, 0, 0);
        redSpot.target.position.set(5, 0, 0);
        redSpot.castShadow = true; 
        this.sirenSpinner.add(redSpot);
        this.sirenSpinner.add(redSpot.target);

        const blueSpot = new THREE.SpotLight(0x0000ff, 200, 100, Math.PI/3, 0.5, 1);
        blueSpot.position.set(-0.1, 0, 0);
        blueSpot.target.position.set(-5, 0, 0);
        blueSpot.castShadow = true; 
        this.sirenSpinner.add(blueSpot);
        this.sirenSpinner.add(blueSpot.target);

        // Add bulbs to spinner
        const redBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({color: 0xff0000}));
        redBulb.position.set(0.01, 0, 0);
        this.sirenSpinner.add(redBulb);

        const blueBulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), new THREE.MeshBasicMaterial({color: 0x0000ff}));
        blueBulb.position.set(-0.01, 0, 0);
        this.sirenSpinner.add(blueBulb);
    }

    generateObstacle(node, fullName) {
        const isGround = fullName.includes('street') || fullName.includes('driveway') || fullName.includes('pavement') || fullName.includes('ground') || fullName.includes('road');
        const isLeaf = fullName.includes('leaf') || fullName.includes('leaves') || fullName.includes('foliage');
        const isBush = fullName.includes('bush') || fullName.includes('shrub');
        const isTree = fullName.includes('tree') || fullName.includes('log') || fullName.includes('birch') || fullName.includes('fir');
        const isHouse = fullName.includes('house');
        const isFence = fullName.includes('fence');
        const isProp  = fullName.includes('bench') || fullName.includes('swings') || fullName.includes('lamp') || fullName.includes('chapman') || fullName.includes('trash');

        if (!isGround && !isLeaf && !isBush) {
             if (isHouse || isFence || isProp || isTree) {
                 const box = new THREE.Box3().setFromObject(node);

                 // 1. REMOVE HIGH FLOATING OBJECTS
                 if (box.min.y > 10) return;

                 // 2. CAP HEIGHT TO 10 UNITS
                 box.max.y = box.min.y + 10;

                 // 3. 🌳 TREE TRUNK FIX 🌳
                 if (isTree) {
                    // Instead of the geometric center (which includes leaves),
                    // we grab the actual PIVOT position of the mesh (usually the bottom of trunk).
                    const rootPos = new THREE.Vector3();
                    node.getWorldPosition(rootPos);

                    // Create a tighter box around the trunk position
                    // Width = 4 units (radius 2)
                    box.min.x = rootPos.x - 2.0; 
                    box.max.x = rootPos.x + 2.0;
                    
                    box.min.z = rootPos.z - 2.0; 
                    box.max.z = rootPos.z + 2.0;
                 }

                 // Recalculate center for the collision logic
                 box.centerPoint = new THREE.Vector3();
                 box.getCenter(box.centerPoint);
                 this.obstacles.push(box);
             }
        }
    }

    update(dt) {
        if (this.mixer) this.mixer.update(dt);
        if (this.sirenSpinner) this.sirenSpinner.rotation.y += 10 * dt;

        this.flickerTimer += dt;
        if (this.flickerTimer > this.nextChangeTime) {
            this.flickerTimer = 0;
            this.nextChangeTime = 0.1 + Math.random() * 0.9;
            this.isLightOn = !this.isLightOn;
            if (this.isLightOn) {
                this.manualLight.intensity = 300;
                this.manualBulb.material.color.setHex(0xffffff);
            } else {
                this.manualLight.intensity = 0;
                this.manualBulb.material.color.setHex(0x222222);
            }
        }
    }
}