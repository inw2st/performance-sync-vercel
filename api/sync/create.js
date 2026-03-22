const { saveSpace } = require("../../lib/blob-store");
const { ensureMethod, json, readJsonBody } = require("../../lib/http");
const { createSecret, createSpaceId, hashSecret } = require("../../lib/security");

module.exports = async function handler(req, res) {
  if (!ensureMethod(req, res, "POST")) {
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (!body.payload) {
      json(res, 400, { error: "payload is required." });
      return;
    }

    const spaceId = createSpaceId();
    const secret = createSecret();
    const updatedAt = body.clientModifiedAt || new Date().toISOString();

    await saveSpace(spaceId, {
      spaceId,
      secretHash: hashSecret(secret),
      version: 1,
      updatedAt,
      lastModifiedBy: body.deviceName || "Unknown device",
      payload: body.payload,
    });

    json(res, 200, {
      syncKey: `${spaceId}.${secret}`,
      version: 1,
      updatedAt,
    });
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to create sync space." });
  }
};
