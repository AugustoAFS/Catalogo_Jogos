"use strict"
$(document).ready(function () {
    const openSettingsButton = document.getElementById("open-settings");
    const settingsSidebar = document.getElementById("settings-sidebar");
    const overlay = document.getElementById("overlay");
    const closeSettingsButton = document.getElementById("close-settings");

    openSettingsButton.addEventListener("click", () => {
        settingsSidebar.classList.add("active");
        overlay.classList.add("active");
    });

    closeSettingsButton.addEventListener("click", () => {
        settingsSidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    overlay.addEventListener("click", () => {
        settingsSidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
});
