import "../../shared/style.css";
import "./style.css";


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