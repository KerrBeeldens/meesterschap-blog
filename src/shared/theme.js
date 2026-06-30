const THEME_KEY = "theme";

// Apply the saved/system theme as early as possible (call this at the
// top of every page, before paint, to avoid a flash of the wrong theme).
function applyStoredTheme() {
    let saved;

    try {
        saved = localStorage.getItem(THEME_KEY);
    } catch (e) {
        saved = null;
    }

    if (saved === "light" || saved === "dark") {
        document.documentElement.dataset.theme = saved;
    }
    // If nothing saved, we just fall back to the OS preference,
    // which the @media (prefers-color-scheme) rules already handle.
}

function getCurrentTheme() {
    const explicit = document.documentElement.dataset.theme;
    if (explicit === "light" || explicit === "dark") return explicit;

    return window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
}

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;

    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
        // Ignore write errors (e.g. storage disabled)
    }
}

function toggleTheme() {
    const next = getCurrentTheme() === "light" ? "dark" : "light";
    setTheme(next);
}

applyStoredTheme();

// Wire up the toggle button if one exists on the page (e.g. a
// dedicated <button class="theme-toggle">). Not required for the
// XMB menu item, which calls toggleTheme() directly on select.
const themeToggleButton = document.querySelector(".theme-toggle");

if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleTheme);
}

export { applyStoredTheme, getCurrentTheme, setTheme, toggleTheme };