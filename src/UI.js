const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '20px';
infoDiv.style.right = '20px';
infoDiv.style.color = '#00ff00';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.padding = '20px 40px';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.fontSize = '30px'; 
infoDiv.style.fontWeight = 'bold';
infoDiv.style.borderRadius = '10px';
infoDiv.style.whiteSpace = 'pre'; 
document.body.appendChild(infoDiv);

export function updateUI(collisionEnabled, isFreeCamera, isCinematicMode) {
    let statusText = "";
    if (isCinematicMode) {
        statusText = "🎥 CINEMATIC MODE PLAYING...";
        infoDiv.style.color = '#ffff00';
    } else {
        const colStatus = collisionEnabled ? 'ON (P)' : 'OFF (P)';
        const camStatus = isFreeCamera ? 'FREE (C)' : 'PLAYER (C)';
        statusText = `COLLISION: ${colStatus}\nCAMERA: ${camStatus}\nCINEMATIC: READY (L)`;
        infoDiv.style.color = collisionEnabled ? '#00ff00' : '#ff0000';
    }
    infoDiv.innerHTML = statusText;
}