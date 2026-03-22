const { loadSpace, saveSpace } = require("../../lib/blob-store");
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

    const clientModifiedAt = body.clientModifiedAt || new Date().toISOString();
    const serverUpdatedAt = space.updatedAt || "";
    const clientWins =
      body.clientKnownVersion === space.version ||
      new Date(clientModifiedAt).getTime() >= new Date(serverUpdatedAt).getTime();

    if (!body.payload) {
      json(res, 400, { error: "payload is required." });
      return;
    }

    if (!clientWins) {
      json(res, 200, {
        spaceId: space.spaceId,
        version: space.version,
        updatedAt: space.updatedAt,
        lastModifiedBy: space.lastModifiedBy || "Unknown device",
        payload: space.payload,
      });
      return;
    }

    const nextRecord = {
      spaceId: space.spaceId,
      secretHash: space.secretHash,
      version: (space.version || 0) + 1,
      updatedAt: clientModifiedAt,
      lastModifiedBy: body.deviceName || "Unknown device",
      payload: body.payload,
    };

    await saveSpace(parsed.spaceId, nextRecord);

    json(res, 200, {
      spaceId: nextRecord.spaceId,
      version: nextRecord.version,
      updatedAt: nextRecord.updatedAt,
      lastModifiedBy: nextRecord.lastModifiedBy,
      payload: nextRecord.payload,
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to push sync state." });
  }
};
