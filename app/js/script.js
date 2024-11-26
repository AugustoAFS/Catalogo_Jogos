"use strict";

$(document).ready(function () {
    // Selecionando elementos com jQuery
    const $openLeftSidebarBtn = $("#open-left-sidebar");
    const $openRightSidebarBtn = $("#open-right-sidebar");
    const $closeCartBtn = $("#close-cart");
    const $overlay = $("#overlay");
    const $leftSidebar = $("#left-sidebar");
    const $rightSidebar = $("#right-sidebar");

    function openSidebar(sidebar) {
        sidebar.addClass("active");
        $overlay.addClass("active");
    }

    function closeSidebars() {
        $leftSidebar.removeClass("active");
        $rightSidebar.removeClass("active");
        $overlay.removeClass("active");
    }

    $openLeftSidebarBtn.on("click", function () {
        openSidebar($leftSidebar);
    });

    $openRightSidebarBtn.on("click", function () {
        openSidebar($rightSidebar);
    });

    $closeCartBtn.on("click", closeSidebars);
    $overlay.on("click", closeSidebars);
});
