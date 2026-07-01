const BUTTONS = {
    CROSS: 0,
    CIRCLE: 1
};

const DEADZONE = 0.3;
const SCROLL_SPEED = 12;

const previousButtons = [];

function justPressed(gamepad, index) {
    const pressed = gamepad.buttons[index]?.pressed ?? false;
    const wasPressed = previousButtons[index] ?? false;

    previousButtons[index] = pressed;

    return pressed && !wasPressed;
}

function gamepadLoop() {
    const gamepad = navigator.getGamepads()[0];

    if (gamepad) {
        // Circle / B -> Back (if present)
        if (justPressed(gamepad, BUTTONS.CIRCLE)) {
            document.querySelector(".back-link")?.click();
        }

        // Cross / A -> Open project (if present)
        if (justPressed(gamepad, BUTTONS.CROSS)) {
            document.querySelector(".project-link")?.click();
        }

        // Left stick scrolling
        const y = gamepad.axes[1];

        if (Math.abs(y) > DEADZONE) {
            window.scrollBy({
                top: y * SCROLL_SPEED,
                behavior: "auto"
            });
        }
    }

    requestAnimationFrame(gamepadLoop);
}

requestAnimationFrame(gamepadLoop);