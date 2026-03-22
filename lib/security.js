const crypto = require("crypto");

function createSpaceId() {
  return crypto.randomBytes(16).toString("hex");
}

function createSecret() {
  return crypto.randomBytes(24).toString("base64url");
}

function hashSecret(secret) {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

function parseSyncKey(syncKey) {
  const trimmed = String(syncKey || "").trim();
  const parts = trimmed.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }

  return {
    spaceId: parts[0],
    secret: parts[1],
  };
}

module.exports = {
  createSecret,
  createSpaceId,
  hashSecret,
  parseSyncKey,
};
