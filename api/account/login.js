const {
    bcrypt,
    getSessionSecret,
    getUsersCollection,
    isValidEmail,
    normalizeEmail,
    parseBody,
    publicUser,
    sendJson,
    setSessionCookie,
} = require("../../lib/account");

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Deze aanvraagmethode wordt niet ondersteund." });
    }

    const body = parseBody(req);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    if (!isValidEmail(email) || !password || Buffer.byteLength(password, "utf8") > 72) {
        return sendJson(res, 400, { error: "Vul een geldig e-mailadres en wachtwoord in." });
    }

    try {
        getSessionSecret();
        const users = await getUsersCollection();
        const user = await users.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return sendJson(res, 401, { error: "E-mailadres of wachtwoord is onjuist." });
        }

        setSessionCookie(res, user._id.toString());
        return sendJson(res, 200, { user: publicUser(user) });
    } catch (error) {
        console.error("Account login failed:", error);
        return sendJson(res, 500, { error: "Inloggen is momenteel niet mogelijk. Probeer het later opnieuw." });
    }
};
