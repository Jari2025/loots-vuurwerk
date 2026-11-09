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
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = normalizeEmail(body?.email);
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const phoneDigits = phone.replace(/\D/g, "");

    if (
        !name ||
        name.length > 100 ||
        !isValidEmail(email) ||
        phone.length > 24 ||
        phoneDigits.length < 8 ||
        phoneDigits.length > 15 ||
        Buffer.byteLength(password, "utf8") < 12 ||
        Buffer.byteLength(password, "utf8") > 72
    ) {
        return sendJson(res, 400, {
            error: "Controleer je naam, e-mailadres, telefoonnummer en wachtwoord (12 tot 72 bytes).",
        });
    }

    try {
        getSessionSecret();
        const users = await getUsersCollection();
        await users.createIndex({ email: 1 }, { unique: true });

        const user = {
            name,
            email,
            phone,
            passwordHash: await bcrypt.hash(password, 12),
            createdAt: new Date(),
        };
        const result = await users.insertOne(user);
        user._id = result.insertedId;

        setSessionCookie(res, result.insertedId.toString());
        return sendJson(res, 201, { user: publicUser(user) });
    } catch (error) {
        if (error.code === 11000) {
            return sendJson(res, 409, { error: "Er bestaat al een account met dit e-mailadres." });
        }
        console.error("Account registration failed:", error);
        return sendJson(res, 500, { error: "Account aanmaken is momenteel niet mogelijk. Probeer het later opnieuw." });
    }
};
