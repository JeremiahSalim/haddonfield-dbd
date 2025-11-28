export const keyState = {};

export function initInput(callbacks) {
    window.addEventListener('keydown', (e) => {
        keyState[e.code] = true;
        
        // Trigger single-press actions via callbacks
        if (callbacks.onKeyDown) callbacks.onKeyDown(e.code);
    });

    window.addEventListener('keyup', (e) => {
        keyState[e.code] = false;
    });
}