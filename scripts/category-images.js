document.querySelectorAll(".category-photo img").forEach((image) => {
    const photo = image.closest(".category-photo");

    image.addEventListener("load", () => {
        photo.classList.add("has-image");
    });

    image.addEventListener("error", () => {
        image.hidden = true;
    });

    if (image.complete && image.naturalWidth > 0) {
        photo.classList.add("has-image");
    }
});
