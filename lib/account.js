const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");

const SESSION_COOKIE = "loots_session";
const SESSION_SECONDS = 7 * 24 * 60 * 60;

async function getUsersCollection() {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("Missing MONGODB_URI environment variable");
    }

    if (!globalThis.lootsMongoClientPromise) {
        const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
        globalThis.lootsMongoClientPromise = client.connect().then(() => client);
    }

    let client;
    try {
        client = await globalThis.lootsMongoClientPromise;
    } catch (error) {
        globalThis.lootsMongoClientPromise = undefined;
        throw error;
    }

    return client
        .db(process.env.MONGODB_DB || "loots-vuurwerk")
        .collection("users");
}

function getSessionSecret() {
    const secret = process.env.SESSION_SECRET;
    if (!secret || Buffer.byteLength(secret, "utf8") < 32) {
        throw new Error("SESSION_SECRET must contain at least 32 bytes");
    }
    return secret;
}

function sendJson(res, status, payload) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(status).json(payload);
}

function parseBody(req) {
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
        return req.body;
    }
    if (typeof req.body === "string") {
        try {
            const body = JSON.parse(req.body);
            return body && typeof body === "object" && !Array.isArray(body) ? body : null;
        } catch {
            return null;
        }
    }
    return null;
}

function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
    };
}

function setSessionCookie(res, userId) {
    const token = jwt.sign({ sub: userId }, getSessionSecret(), {
        expiresIn: SESSION_SECONDS,
        issuer: "loots-vuurwerk",
    });
    const secure =
        process.env.VERCEL === "1" || process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}${secure}`,
    );
}

function clearSessionCookie(res) {
    const secure =
        process.env.VERCEL === "1" || process.env.NODE_ENV === "production" ? "; Secure" : "";
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
    );
}

function getSessionUserId(req) {
    const secret = getSessionSecret();
    const cookies = (req.headers.cookie || "").split(";");
    const sessionCookie = cookies.find((cookie) => cookie.trim().startsWith(`${SESSION_COOKIE}=`));
    if (!sessionCookie) {
        return null;
    }

    const token = sessionCookie.trim().slice(SESSION_COOKIE.length + 1);
    try {
        const payload = jwt.verify(token, secret, { issuer: "loots-vuurwerk" });
        return typeof payload.sub === "string" ? payload.sub : null;
    } catch (error) {
        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            return null;
        }
        throw error;
    }
}

function isValidEmail(email) {
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = {
    bcrypt,
    clearSessionCookie,
    getSessionUserId,
    getSessionSecret,
    getUsersCollection,
    isValidEmail,
    normalizeEmail,
    ObjectId,
    parseBody,
    publicUser,
    sendJson,
    setSessionCookie,
};
