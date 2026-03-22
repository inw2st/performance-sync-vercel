const { loadBootstrap, loadSpace, saveBootstrap, saveSpace } = require("../../lib/blob-store");
const { ensureMethod, json, readJsonBody } = require("../../lib/http");
const { createSecret, createSpaceId, hashSecret } = require("../../lib/security");

module.exports = async function handler(req, res) {
  if (!ensureMethod(req, res, "POST")) {
    return;
  }

  try {
    const existing = await loadBootstrap();
    if (existing) {
      json(res, 200, existing);
      return;
    }

    const body = await readJsonBody(req);
    if (!body.payload) {
      json(res, 400, { error: "payload is required." });
      return;
    }

    const createdAt = body.clientModifiedAt || new Date().toISOString();
    const spaceId = createSpaceId();
    const secret = createSecret();
    const syncKey = `${spaceId}.${secret}`;
    const creatorDeviceName = body.deviceName || "Unknown device";

    await saveSpace(spaceId, {
      spaceId,
      secretHash: hashSecret(secret),
      version: 1,
      updatedAt: createdAt,
      lastModifiedBy: creatorDeviceName,
      payload: body.payload,
    });

    const bootstrap = {
      syncKey,
      creatorDeviceName,
      createdAt,
      version: 1,
      updatedAt: createdAt,
    };

    await saveBootstrap(bootstrap);

    const savedBootstrap = await loadBootstrap();
    json(res, 200, savedBootstrap || bootstrap);
  } catch (error) {
    json(res, 500, { error: error.message || "Failed to create bootstrap sync space." });
  }
};
