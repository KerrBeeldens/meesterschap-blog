import "../../shared/style.css";
import "./style.css";
import { toggleTheme } from "../../shared/theme.js";

const clock = document.querySelector(".clock");
const time = document.querySelector("time");

// Based on https://stackoverflow.com/a/39418437
function updateDateTime() {
    const date = new Date();

    // Get the date in the format dd/mm
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dateString = ("0" + day).slice(-2) + "/" + ("0" + month).slice(-2);

    // Get the time in the format  HH:mm
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const timeString = ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2);

    // Set the time on the UI
    time.textContent = dateString + " " + timeString;
    clock.style.setProperty("--minutes", minutes);
    clock.style.setProperty("--hours", hours + minutes / 60);
}

// Update the time once, then every second
updateDateTime();
setInterval(updateDateTime, 1000);

const main = document.querySelector("main");
const categories = document.querySelector(".xmb");
const items = categories.querySelectorAll("ol");

// sounds
const selectSound = document.querySelector(".select-sound");
const bootSound = document.querySelector(".boot-sound");
const cursorSound = document.querySelector(".cursor-sound");

// ---- Persisted state (localStorage) ----
const STORAGE_KEY = "xmb-offsets";

let offsetX = 0;
let offsetY = Array.from({ length: items.length }, () => 0);

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function loadState() {
    let raw;

    try {
        raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        // localStorage unavailable (e.g. private browsing); fall back to defaults
        return;
    }

    if (!raw) return;

    try {
        const parsed = JSON.parse(raw);

        if (typeof parsed.offsetX === "number") {
            offsetX = clamp(parsed.offsetX, 0, items.length - 1);
        }

        if (Array.isArray(parsed.offsetY)) {
            offsetY = Array.from({ length: items.length }, (_, i) => {
                const savedValue = parsed.offsetY[i];
                const itemCount = items[i].children.length;

                if (typeof savedValue !== "number") return 0;

                return clamp(savedValue, 0, itemCount - 1);
            });
        }
    } catch (e) {
        // Corrupt data; ignore and keep defaults
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ offsetX, offsetY }));
    } catch (e) {
        // Ignore write errors (e.g. storage full or disabled)
    }
}

loadState();

function render() {
    // Category
    const categoryWidth = categories.children[0].offsetWidth + parseFloat(getComputedStyle(categories).gap);

    categories.style.transform = `translateX(-${offsetX * categoryWidth}px)`;

    // Items
    const currentItems = items[offsetX];
    const activeIndex = offsetY[offsetX];
    const itemMargin = parseFloat(getComputedStyle(currentItems.children[0]).marginBottom);
    const itemHeight = currentItems.children[0].offsetHeight + itemMargin;
    const categoryGap = parseFloat(getComputedStyle(categories.children[offsetX]).gap);
    const categoryItemHeight = categories.children[offsetX].querySelector(".category-icon").offsetHeight + categoryGap;

    // Items
    items.forEach((list, categoryIndex) => {
        const activeIndex = offsetY[categoryIndex];

        const firstItem = list.children[0];
        if (!firstItem) return;

        const itemMargin = parseFloat(getComputedStyle(firstItem).marginBottom);
        const itemHeight = firstItem.offsetHeight + itemMargin;

        const categoryGap = parseFloat(getComputedStyle(categories.children[categoryIndex]).gap);
        const categoryItemHeight =
            categories.children[categoryIndex]
                .querySelector(".category-icon")
                .offsetHeight + categoryGap;

        Array.from(list.children).forEach((element, i) => {
            const distance = i - activeIndex;

            if (distance >= 0) {
                element.style.transform = `translateY(${-activeIndex * itemHeight}px)`;
            } else {
                element.style.transform =
                    `translateY(calc(${-activeIndex * itemHeight}px - ${categoryItemHeight}px - ${itemMargin}px))`;
            }
        });
    });

    // Highlight selected category
    Array.from(categories.children).forEach(el => el.classList.remove("selected"));
    categories.children[offsetX].classList.add("selected");

    // Highlight selected item
    items.forEach(list =>
        Array.from(list.children).forEach(el => el.classList.remove("selected"))
    );

    items[offsetX].children[offsetY[offsetX]].classList.add("selected");
}

function moveX(delta) {
    const totalCategories = categories.children.length;

    const oldOffsetX = offsetX;
    offsetX = Math.min(Math.max(offsetX + delta, 0), totalCategories - 1);

    if (oldOffsetX !== offsetX) {
        cursorSound.play();
        saveState();
    }

    render();
}

function moveY(delta) {
    const currentItems = items[offsetX];
    const totalItems = currentItems.children.length;

    const oldOffsetY = offsetY[offsetX];
    offsetY[offsetX] = Math.min(Math.max(offsetY[offsetX] + delta, 0), totalItems - 1);

    if (oldOffsetY !== offsetY[offsetX]) {
        cursorSound.play();
        saveState();
    }

    render();
}

document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") moveX(1);
    if (e.key === "ArrowLeft") moveX(-1);
    if (e.key === "ArrowUp") moveY(-1);
    if (e.key === "ArrowDown") moveY(1);

    if (e.code === "Space") {
        e.preventDefault();

        selectSound.currentTime = 0;
        selectSound.play();

        selectSound.onended = () => {
            selectSound.onended = null;
            openArticle();
        };
    }
});

const BUTTONS = {
    X: 0,      // Cross / A
    UP: 12,
    DOWN: 13,
    LEFT: 14,
    RIGHT: 15,
};

const previousButtons = [];
const previousAxes = [0, 0];
const DEADZONE = 0.5;

function justPressedButton(gamepad, index) {
    const pressed = gamepad.buttons[index].pressed;
    const previous = previousButtons[index] || false;

    previousButtons[index] = pressed;

    return pressed && !previous;
}

function justMovedAxis(value, previous, positive) {
    if (positive) {
        return value > DEADZONE && previous <= DEADZONE;
    }

    return value < -DEADZONE && previous >= -DEADZONE;
}

function gamepadLoop() {
    const gamepad = navigator.getGamepads()[0];

    if (gamepad) {
        // D-pad
        if (justPressedButton(gamepad, BUTTONS.LEFT)) moveX(-1);
        if (justPressedButton(gamepad, BUTTONS.RIGHT)) moveX(1);
        if (justPressedButton(gamepad, BUTTONS.UP)) moveY(-1);
        if (justPressedButton(gamepad, BUTTONS.DOWN)) moveY(1);

        // Left stick
        if (justMovedAxis(gamepad.axes[0], previousAxes[0], false)) moveX(-1);
        if (justMovedAxis(gamepad.axes[0], previousAxes[0], true)) moveX(1);

        if (justMovedAxis(gamepad.axes[1], previousAxes[1], false)) moveY(-1);
        if (justMovedAxis(gamepad.axes[1], previousAxes[1], true)) moveY(1);

        previousAxes[0] = gamepad.axes[0];
        previousAxes[1] = gamepad.axes[1];

        // X / A button
        if (justPressedButton(gamepad, BUTTONS.X)) {
            selectSound.currentTime = 0;
            selectSound.play();

            selectSound.onended = () => {
                selectSound.onended = null;
                openArticle();
            };
        }
    }

    requestAnimationFrame(gamepadLoop);
}

requestAnimationFrame(gamepadLoop);

const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => {
        render();
    });
});

resizeObserver.observe(main);
render();

function toKebabCase(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
}

function openArticle() {
    const currentCategory = categories.children[offsetX];

    const categoryName = currentCategory
        .querySelector(".category-icon .text")
        .textContent;

    const itemName = currentCategory
        .querySelectorAll(".item")[offsetY[offsetX]]
        .textContent
        .trim()
        .replace(/\s+/g, " ");

    // Special case: the "Light/dark mode" item under Settings doesn't
    // navigate to a page, it toggles the theme instead.
    if (categoryName === "Settings" && itemName === "Light/dark mode") {
        toggleTheme();
        return;
    }

    const url = `/meesterschap-blog/${toKebabCase(categoryName)}/${toKebabCase(itemName)}`;

    window.location.href = url;
}

// Also allow toggling via a direct mouse click on the item itself,
// not just via Space / gamepad select.
document.querySelectorAll(".item").forEach((el) => {
    el.addEventListener("click", () => {
        if (el.textContent.trim() === "Light/dark mode") {
            toggleTheme();
        }
    });
});