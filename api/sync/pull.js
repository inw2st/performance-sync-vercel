const { loadSpace } = require("../../lib/blob-store");
const { ensureMethod, json, readJsonBody } = require("../../lib/http");
const { hashSecret, parseSyncKey } = require("../../lib/security");

module.exports = async function handler(req, res) {
  if (!ensureMethod(req, res, "POST")) {
    return;
  }

  try {
    const body = await readJsonBody(req);
    const parsed = parseSyncKey(body.syncKey);
    if (!parsed) {
      json(res, 400, { error: "Invalid sync key." });
      return;
    }

    const space = await loadSpace(parsed.spaceId);
    if (!space) {
      json(res, 404, { error: "Sync space not found." });
      return;
    }

    if (space.secretHash !== hashSecret(parsed.secret)) {
      json(res, 403, { error: "Invalid sync key." });
      return;
    }

    json(res, 200, {
      spaceId: space.spaceId,
      version: space.version,
      updatedAt: space.updatedAt,
      lastModifiedBy: space.lastModifiedBy || "Unknown device",
      payload: space.payload,
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to pull sync state." });
  }
};
