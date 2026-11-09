const newsletterForm = document.querySelector(".newsletter-form");
const newsletterNotice = document.querySelector(".newsletter-notice");

newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletterNotice.textContent =
        "Aanmelden is nog niet mogelijk: koppel eerst een nieuwsbriefdienst. Je gegevens zijn niet verstuurd of opgeslagen.";
});
