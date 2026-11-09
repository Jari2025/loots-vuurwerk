const {
    getSessionUserId,
    getUsersCollection,
    ObjectId,
    publicUser,
    sendJson,
} = require("../../lib/account");

module.exports = async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return sendJson(res, 405, { error: "Deze aanvraagmethode wordt niet ondersteund." });
    }

    try {
        const userId = getSessionUserId(req);
        if (!userId || !ObjectId.isValid(userId)) {
            return sendJson(res, 401, { error: "Je bent niet ingelogd." });
        }

        const users = await getUsersCollection();
        const user = await users.findOne(
            { _id: new ObjectId(userId) },
            { projection: { passwordHash: 0 } },
        );
        if (!user) {
            return sendJson(res, 401, { error: "Je bent niet ingelogd." });
        }

        return sendJson(res, 200, { user: publicUser(user) });
    } catch (error) {
        console.error("Account profile lookup failed:", error);
        return sendJson(res, 500, { error: "Accountgegevens ophalen is momenteel niet mogelijk." });
    }
};
