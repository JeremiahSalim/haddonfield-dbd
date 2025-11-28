import * as THREE from 'three';
import { createScene } from './src/SceneSetup.js';
import { updateUI } from './src/UI.js';
import { initInput } from './src/Input.js';
import { World } from './src/World.js';
import { Player } from './src/Player.js';
import { CinematicManager } from './src/Cinematics.js';

// --- STATE ---
const state = {
    collisionEnabled: true,
    isFreeCamera: false,
    isCinematicMode: false
};

// --- INIT SYSTEMS ---
const { scene, camera, renderer, controls } = createScene();
const world = new World(scene);
const player = new Player(scene, camera);
const cinematics = new CinematicManager(camera, player);

updateUI(state.collisionEnabled, state.isFreeCamera, state.isCinematicMode);

// --- INPUT HANDLER ---
initInput({
    onKeyDown: (code) => {
        if (state.isCinematicMode) return;

        if (code === 'KeyP') {
            state.collisionEnabled = !state.collisionEnabled;
            updateUI(state.collisionEnabled, state.isFreeCamera, state.isCinematicMode);
        }
        if (code === 'KeyC') {
            state.isFreeCamera = !state.isFreeCamera;
            updateUI(state.collisionEnabled, state.isFreeCamera, state.isCinematicMode);
            if (!state.isFreeCamera) controls.target.copy(player.mesh.position);
        }
        if (code === 'KeyL') {
            state.isCinematicMode = true;
            controls.enabled = false;
            cinematics.start();
            updateUI(state.collisionEnabled, state.isFreeCamera, state.isCinematicMode);
        }
    }
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    const dt = clock.getDelta();

    world.update(dt); // Flickering lights, sirens
    
    // Check if cinematic just finished
    if (state.isCinematicMode && !cinematics.isActive) {
        state.isCinematicMode = false;
        controls.enabled = true;
        controls.target.copy(player.mesh.position);
        updateUI(state.collisionEnabled, state.isFreeCamera, state.isCinematicMode);
    }

    if (state.isCinematicMode) {
        cinematics.update(dt);
    } else {
        player.update(dt, world.obstacles, state.collisionEnabled, state.isFreeCamera);
        controls.update();
        // Camera follow logic if not free cam
        if (!state.isFreeCamera) controls.target.copy(player.mesh.position);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();