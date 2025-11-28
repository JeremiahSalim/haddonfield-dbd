import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { keyState } from './Input.js';

export class Player {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.mesh = null;  // The invisible box
        this.model = null; // The visible Michael
        this.mixer = null;
        this.actions = { walk: null, idle: null };
        this.activeAction = null;
        
        this.speed = 10;
        this.checkRadiusSq = 20 * 20;

        this.initPlayerBox();
        this.loadModel();
    }

    initPlayerBox() {
        const playerGeo = new THREE.BoxGeometry(3, 8, 3);
        const playerMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, transparent: true, opacity: 0.0 });
        this.mesh = new THREE.Mesh(playerGeo, playerMat);
        this.mesh.position.set(0, 4, 0);
        this.scene.add(this.mesh);
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load("./assets/michael.glb", (gltf) => {
            this.model = gltf.scene;
            this.model.scale.set(0.045, 0.045, 0.045);
            this.model.position.set(0, -4, 0); // Offset inside box

            this.model.traverse(node => {
                if (node.isMesh) { node.castShadow = true; node.receiveShadow = true; }
            });

            this.mixer = new THREE.AnimationMixer(this.model);
            const clipWalk = THREE.AnimationClip.findByName(gltf.animations, "Myers|MM_WalkFT");
            const clipIdle = THREE.AnimationClip.findByName(gltf.animations, "Myers|MM_Idle");

            if (clipWalk) this.actions.walk = this.mixer.clipAction(clipWalk);
            if (clipIdle) this.actions.idle = this.mixer.clipAction(clipIdle);

            if (this.actions.idle) {
                this.actions.idle.play();
                this.activeAction = this.actions.idle;
            }

            this.mesh.add(this.model);
            console.log("🔪 Michael Myers Loaded");
        });
    }

    playAnim(name) {
        const newAction = this.actions[name];
        if (!newAction || this.activeAction === newAction) return;

        if (this.activeAction) this.activeAction.fadeOut(0.2);
        newAction.reset().fadeIn(0.2).play();
        this.activeAction = newAction;
    }

    update(dt, obstacles, collisionEnabled, isInputBlocked) {
        if (this.mixer) this.mixer.update(dt);
        if (isInputBlocked) return; 

        // Movement Logic
        const tempCameraForward = new THREE.Vector3();
        this.camera.getWorldDirection(tempCameraForward);
        tempCameraForward.y = 0; tempCameraForward.normalize();
        
        const tempCameraRight = new THREE.Vector3().crossVectors(tempCameraForward, this.camera.up).normalize();
        const tempMoveDir = new THREE.Vector3(0, 0, 0);

        if (keyState['KeyW']) tempMoveDir.add(tempCameraForward);
        if (keyState['KeyS']) tempMoveDir.sub(tempCameraForward);
        if (keyState['KeyD']) tempMoveDir.add(tempCameraRight);
        if (keyState['KeyA']) tempMoveDir.sub(tempCameraRight);

        if (tempMoveDir.lengthSq() > 0) {
            tempMoveDir.normalize();
            this.playAnim('walk');

            // Rotate Player
            const lookTarget = this.mesh.position.clone().add(tempMoveDir);
            this.mesh.lookAt(lookTarget);

            // Calculate Collision
            const moveDist = this.speed * dt;
            const tempProposedPos = this.mesh.position.clone().addScaledVector(tempMoveDir, moveDist);
            
            let crash = false;
            if (collisionEnabled) {
                 const tempPlayerBox = new THREE.Box3().setFromCenterAndSize(tempProposedPos, new THREE.Vector3(3, 8, 3));
                 for (let obs of obstacles) {
                    if (tempProposedPos.distanceToSquared(obs.centerPoint) < this.checkRadiusSq) {
                        if (tempPlayerBox.intersectsBox(obs)) { crash = true; break; }
                    }
                 }
            }

            if (!crash) this.mesh.position.copy(tempProposedPos);
        } else {
            this.playAnim('idle');
        }
    }
}