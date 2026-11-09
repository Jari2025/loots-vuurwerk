const { clearSessionCookie, sendJson } = require("../../lib/account");

module.exports = function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Deze aanvraagmethode wordt niet ondersteund." });
    }

    clearSessionCookie(res);
    return sendJson(res, 200, { success: true });
};
