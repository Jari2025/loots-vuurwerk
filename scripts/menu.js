const productsMenu = document.querySelector(".has-submenu");
const productDropdown = productsMenu.querySelector(".product-dropdown");
const knalMenu = productDropdown.querySelector(".has-side-menu");
const knalDetails = knalMenu.querySelector("details");
const knalSummary = knalDetails.querySelector("summary");
const sideMenu = knalMenu.querySelector(".side-menu");

knalSummary.addEventListener("pointerenter", () => {
    knalMenu.classList.remove("is-dismissed");
});

sideMenu.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") {
        return;
    }

    knalDetails.open = false;
    knalMenu.classList.add("is-dismissed");
});

productsMenu.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "touch") {
        return;
    }

    knalDetails.open = false;
    knalMenu.classList.remove("is-dismissed");

    if (productsMenu.contains(document.activeElement)) {
        document.activeElement.blur();
    }
});
