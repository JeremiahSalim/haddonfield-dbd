import * as THREE from 'three';

const cinematicShots = [
    // --- SCENE 1 ---
    {
        duration: 8.0,
        startPos: new THREE.Vector3(-14, 40, 130),
        endPos:   new THREE.Vector3(-5, 40, 130),
        lookDir:  new THREE.Vector3(0, 0, -1) 
    },
    // --- SCENE 2 ---
    {
        duration: 6.0,
        startPos: new THREE.Vector3(75, 17, -100),
        endPos:   new THREE.Vector3(75, 17, -85),
        lookDir:  new THREE.Vector3(-0.4, 0, 0.9) 
    },
    // --- SCENE 3 ---
    {
        duration: 7.0,
        startPos: new THREE.Vector3(-172, 6, 30),
        endPos:   new THREE.Vector3(-140, 6, 30),
        lookDir:  new THREE.Vector3(0.8, 0.06, -0.2) 
    },
    // --- SCENE 4 ---
    {
        duration: 4.0,
        startPos: new THREE.Vector3(-68.27, 30, 20),
        endPos:   new THREE.Vector3(-68, 29, 21),
        lookDir:  new THREE.Vector3(-0.5, -0.3, 0.87) 
    },
    // --- SCENE 5 ---
    {
        duration: 9.0,
        startPos: new THREE.Vector3(-97, 2, 29),
        endPos:   new THREE.Vector3(-97, 2, 30),
        startLookDir: new THREE.Vector3(0.1, -0.1, 1), 
        endLookDir:   new THREE.Vector3(0.2, 0.1, 1)   
    },
    // --- SCENE 6 ---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(-124, 13, 48),
        endPos:   new THREE.Vector3(-122, 13, 40),
        startLookDir: new THREE.Vector3(0.8, 0, 0.37), 
        endLookDir:   new THREE.Vector3(0.62, 0, 0.62)   
    },
    // --- SCENE 7 ---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(-96, 8, 86),
        endPos:   new THREE.Vector3(-98, 8, 83),
        startLookDir: new THREE.Vector3(0.48, 0, -0.86), 
        endLookDir:   new THREE.Vector3(0.6, 0, -0.8)   
    },
    // --- SCENE 8 ---
    {
        duration: 3.0,
        startPos: new THREE.Vector3(-135.5, 19, 73.5),
        endPos:   new THREE.Vector3(-135, 19, 73),
        lookDir:  new THREE.Vector3(0.61, -0.15, -0.75) 
    },
    // --- SCENE 9 ---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(84, 19, 70),
        endPos:   new THREE.Vector3(84, 19, 62),
        startLookDir: new THREE.Vector3(-0.67, 0, -0.72), 
        endLookDir:   new THREE.Vector3(-0.91, 0, -0.38)   
    },
    // --- SCENE 10 ---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(35, 6, -6),
        endPos:   new THREE.Vector3(47, 6, -7),
        startLookDir: new THREE.Vector3(0, 0, -1), 
        endLookDir:   new THREE.Vector3(-0.3, 0, -0.9)   
    },
    // --- SCENE 11 ---
    {
        duration: 4.0,
        startPos: new THREE.Vector3(-2.84, 4, 87),
        endPos:   new THREE.Vector3(-5.80, 4, 86),
        lookDir:  new THREE.Vector3(-0.74, 0.37, -0.56) 
    },
    // --- SCENE 12 ---
    {
        duration: 3.0,
        startPos: new THREE.Vector3(6, 6, -9.7),
        endPos:   new THREE.Vector3(8, 6, -9),
        lookDir:  new THREE.Vector3(0.97, 0, 0.23) 
    },
    // --- SCENE 13 (Michael Myers Appear)---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(-30, 6, 36),
        endPos:   new THREE.Vector3(-30, 6, 32),
        lookDir:  new THREE.Vector3(-1, 0, 0) 
    },
    // --- SCENE 14 (Michael Myers Appear)---
    {
        type: 'orbit',
        duration: 8.0,
        center: new THREE.Vector3(-34, 9, 4.35),
        radius: 4.0,
        height: 9.0,
        angleStart: 2.5, 
        angleEnd: 0.5 
    },
    // --- SCENE 15  (Michael Myers Appear)---
    {
        duration: 5.0,
        startPos: new THREE.Vector3(-77, 3, 28),
        endPos:   new THREE.Vector3(-78, 3, 31.5),
        lookDir:  new THREE.Vector3(-0.2, 0.15, 0.98) 
    },
];

export class CinematicManager {
    constructor(camera, player) {
        this.camera = camera;
        this.player = player; // This is the Player Class Instance
        this.isActive = false;
        this.currentShotIndex = 0;
        this.shotTimer = 0;
        this.tempDir = new THREE.Vector3();
    }

    start() {
        this.isActive = true;
        this.currentShotIndex = 0;
        this.shotTimer = 0;
        console.log("🎬 Cinematic Started");
    }

    stop() {
        this.isActive = false;
        // Access via this.player.model
        if(this.player.model) this.player.model.visible = true; 
        console.log("🎬 Cinematic Ended");
    }

    update(dt) {
        if (!this.isActive) return;

        const shot = cinematicShots[this.currentShotIndex];
        this.shotTimer += dt;
        const progress = Math.min(this.shotTimer / shot.duration, 1.0);

        // --- Camera Movement Logic ---
        if (shot.type === 'orbit') {
            const currentAngle = THREE.MathUtils.lerp(shot.angleStart, shot.angleEnd, progress);
            this.camera.position.x = shot.center.x + Math.cos(currentAngle) * shot.radius;
            this.camera.position.z = shot.center.z + Math.sin(currentAngle) * shot.radius;
            this.camera.position.y = shot.height;
            this.camera.lookAt(shot.center);
        } else {
            this.camera.position.lerpVectors(shot.startPos, shot.endPos, progress);
            if (shot.startLookDir && shot.endLookDir) {
                this.tempDir.lerpVectors(shot.startLookDir, shot.endLookDir, progress);
            } else {
                this.tempDir.copy(shot.lookDir);
            }
            this.camera.lookAt(this.camera.position.clone().add(this.tempDir));
        }

        // ============================================
        // 🔪 MICHAEL MYERS LOGIC (FIXED)
        // ============================================
        
        // ⚠️ Helper variables to access Player Class
        const pMesh = this.player.mesh; 
        const pModel = this.player.model;

        if (this.currentShotIndex === 12) {
            // SCENE 13 (Index 12): Visible & Moving
            if (pModel) pModel.visible = true;

            const mmStart = new THREE.Vector3(-60, 4, 50);
            const mmEnd = new THREE.Vector3(-60, 4, 20);
            
            // Use pMesh instead of player
            pMesh.position.lerpVectors(mmStart, mmEnd, progress);

            const lookTarget = pMesh.position.clone().add(new THREE.Vector3(0, 0, -1));
            pMesh.lookAt(lookTarget);

            // Use Player Helper Function
            this.player.playAnim('walk');
        } 
        else if (this.currentShotIndex === 13) {
            // SCENE 14 (Index 13): Visible but Static Idle
            if (pModel) pModel.visible = true;

            pMesh.position.set(-34, 4, 4.35);
            
            const lookTarget = pMesh.position.clone().add(new THREE.Vector3(1, 0, 0));
            pMesh.lookAt(lookTarget);

            this.player.playAnim('idle');
        }
        else if (this.currentShotIndex === 14) {
            // SCENE 15 (Index 14): Visible but Static Idle
            if (pModel) pModel.visible = true;

            pMesh.position.set(-87, 8, 67);

            const lookTarget = pMesh.position.clone().add(new THREE.Vector3(0, 0, -1));
            pMesh.lookAt(lookTarget);

            this.player.playAnim('idle');
        }
        else {
            // ALL OTHER SCENES: Invisible
            if (pModel) pModel.visible = false;
        }
        
        if (progress >= 1.0) {
            this.currentShotIndex++;
            this.shotTimer = 0;
            if (this.currentShotIndex >= cinematicShots.length) this.stop();
        }
    }
}