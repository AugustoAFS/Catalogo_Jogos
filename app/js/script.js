"use strict"
$(document).ready(function () {
    // Selecionando os elementos da sidebar esquerda e direita
    const openLeftSidebarBtn = document.getElementById("open-left-sidebar");
    const closeCartBtn = document.getElementById("close-cart");
    const openRightSidebarBtn = document.getElementById("open-right-sidebar");
    const leftSidebar = document.getElementById("left-sidebar");
    const rightSidebar = document.getElementById("right-sidebar");
    const overlay = document.getElementById("overlay");

    openLeftSidebarBtn.addEventListener("click", function() {
        leftSidebar.classList.add("active");
        overlay.classList.add("active");
    });

    overlay.addEventListener("click", function() {
        leftSidebar.classList.remove("active");
        rightSidebar.classList.remove("active");
        overlay.classList.remove("active");
    });

    openRightSidebarBtn.addEventListener("click", function() {
        rightSidebar.classList.add("active");
        overlay.classList.add("active");
    });

    closeCartBtn.addEventListener("click", function() {
        rightSidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
});
