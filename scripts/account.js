const authView = document.querySelector("#account-auth");
const profileView = document.querySelector("#account-profile");
const message = document.querySelector("#account-message");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const loginTab = document.querySelector("#login-tab");
const registerTab = document.querySelector("#register-tab");
const logoutButton = document.querySelector("#logout-button");

function showMessage(text, kind = "") {
    message.textContent = text;
    message.dataset.kind = kind;
}

function switchForm(formName) {
    const showLogin = formName === "login";
    loginForm.hidden = !showLogin;
    registerForm.hidden = showLogin;
    loginTab.setAttribute("aria-selected", String(showLogin));
    registerTab.setAttribute("aria-selected", String(!showLogin));
    showMessage("");
}

function showProfile(user) {
    authView.hidden = true;
    profileView.hidden = false;
    document.querySelector("#profile-name").textContent = user.name;
    document.querySelector("#profile-email").textContent = user.email;
    document.querySelector("#profile-phone").textContent = user.phone;
}

async function requestJson(path, options = {}) {
    const response = await fetch(path, {
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || "Er ging iets mis. Probeer het opnieuw.");
    }

    return result;
}

async function submitForm(form, path, data, buttonLabel) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Even geduld...";
    showMessage("");

    try {
        const result = await requestJson(path, {
            method: "POST",
            body: JSON.stringify(data),
        });
        showProfile(result.user);
        showMessage("Je bent ingelogd.", "success");
        form.reset();
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = buttonLabel;
    }
}

loginTab.addEventListener("click", () => switchForm("login"));
registerTab.addEventListener("click", () => switchForm("register"));

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(loginForm);
    submitForm(loginForm, "/api/account/login", {
        email: formData.get("email"),
        password: formData.get("password"),
    }, "Inloggen");
});

registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(registerForm);
    submitForm(registerForm, "/api/account/register", {
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        password: formData.get("password"),
    }, "Account aanmaken");
});

logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;

    try {
        await requestJson("/api/account/logout", { method: "POST", body: "{}" });
        profileView.hidden = true;
        authView.hidden = false;
        switchForm("login");
        showMessage("Je bent uitgelogd.", "success");
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        logoutButton.disabled = false;
    }
});

requestJson("/api/account/me")
    .then(({ user }) => showProfile(user))
    .catch((error) => {
        if (error.message !== "Je bent niet ingelogd.") {
            showMessage(error.message, "error");
        }
    });
