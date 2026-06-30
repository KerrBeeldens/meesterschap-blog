// controller.js

const BACK_BUTTON = 1; // Circle (PS) / B (Xbox)
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
        // Circle / B -> Back
        if (justPressed(gamepad, BACK_BUTTON)) {
            document.querySelector(".back-link")?.click();
        }

        // Left stick vertical scrolling
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

window.addEventListener("gamepadconnected", (e) => {
    console.log("Gamepad connected:", e.gamepad.id);
});

requestAnimationFrame(gamepadLoop);